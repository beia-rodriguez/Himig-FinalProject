import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: number): Promise<Order> {
    const savedOrderId = await this.dataSource.transaction(async (manager) => {
      // Lock product row to prevent double-purchasing race conditions
      const product = await manager.findOne(Product, {
        where: { id: createOrderDto.productId },
        relations: { seller: true },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${createOrderDto.productId} not found`);
      }

      if (product.productStatus !== ProductStatus.AVAILABLE) {
        throw new ConflictException(
          `Product is currently ${product.productStatus} and cannot be purchased`,
        );
      }

      if (product.seller.id === buyerId) {
        throw new BadRequestException('You cannot purchase your own product listing');
      }

      const order = manager.create(Order, {
        buyer: { id: buyerId } as User,
        product: { id: product.id } as Product,
        totalAmount: product.price,
        deliveryAddress: createOrderDto.deliveryAddress,
        orderStatus: OrderStatus.PENDING,
      });

      const createdOrder = await manager.save(Order, order);

      // Reserve the product immediately upon order creation
      product.productStatus = ProductStatus.RESERVED;
      await manager.save(Product, product);

      return createdOrder.id;
    });

    return this.findOne(savedOrderId, buyerId, UserRole.ADMIN);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: {
        buyer: true,
        product: { seller: true },
        payments: true,
        shipment: true,
        review: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyOrders(buyerId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { buyer: { id: buyerId } },
      relations: {
        buyer: true,
        product: { seller: true },
        payments: true,
        shipment: true,
        review: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number, userRole: UserRole): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        buyer: true,
        product: { seller: true },
        payments: true,
        shipment: true,
        review: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const isBuyer = order.buyer.id === userId;
    const isSeller = order.product.seller.id === userId;

    if (!isBuyer && !isSeller && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to view this order');
    }

    return order;
  }
}