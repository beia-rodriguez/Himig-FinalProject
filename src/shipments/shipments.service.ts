import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Shipment, ShippingStatus } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentsRepository: Repository<Shipment>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createShipmentDto: CreateShipmentDto,
    userId: number,
    userRole: UserRole,
  ): Promise<Shipment> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: createShipmentDto.orderId },
        relations: { product: { seller: true }, shipment: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${createShipmentDto.orderId} not found`);
      }

      if (order.product.seller.id !== userId && userRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Only the seller can create a shipment for this order');
      }

      if (order.orderStatus !== OrderStatus.CONFIRMED) {
        throw new BadRequestException(
          'Shipment can only be created after the order is Confirmed (paid)',
        );
      }

      if (order.shipment) {
        throw new ConflictException('A shipment record already exists for this order');
      }

      if (createShipmentDto.trackingNumber) {
        const existingTracking = await manager.findOne(Shipment, {
          where: { trackingNumber: createShipmentDto.trackingNumber },
        });
        if (existingTracking) {
          throw new ConflictException('Tracking number already exists');
        }
      }

      const shipment = manager.create(Shipment, {
        order: { id: order.id } as Order,
        courierName: createShipmentDto.courierName,
        trackingNumber: createShipmentDto.trackingNumber ?? null,
        shippingStatus: createShipmentDto.shippingStatus ?? ShippingStatus.SHIPPED,
      });

      return manager.save(Shipment, shipment);
    });
  }

  async update(
    id: number,
    updateShipmentDto: UpdateShipmentDto,
    userId: number,
    userRole: UserRole,
  ): Promise<Shipment> {
    return this.dataSource.transaction(async (manager) => {
      const shipment = await manager.findOne(Shipment, {
        where: { id },
        relations: { order: { product: { seller: true } } },
      });

      if (!shipment) {
        throw new NotFoundException(`Shipment with ID ${id} not found`);
      }

      if (shipment.order.product.seller.id !== userId && userRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Only the seller or an admin can update this shipment');
      }

      if (
        updateShipmentDto.trackingNumber &&
        updateShipmentDto.trackingNumber !== shipment.trackingNumber
      ) {
        const existingTracking = await manager.findOne(Shipment, {
          where: { trackingNumber: updateShipmentDto.trackingNumber },
        });
        if (existingTracking) {
          throw new ConflictException('Tracking number already exists');
        }
      }

      Object.assign(shipment, updateShipmentDto);
      const updatedShipment = await manager.save(Shipment, shipment);

      // When delivered, mark order Completed and product Sold
      if (updatedShipment.shippingStatus === ShippingStatus.DELIVERED) {
        const order = shipment.order;
        order.orderStatus = OrderStatus.COMPLETED;
        await manager.save(Order, order);

        const product = order.product;
        product.productStatus = ProductStatus.SOLD;
        await manager.save(Product, product);
      }

      return updatedShipment;
    });
  }
}