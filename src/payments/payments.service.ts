import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: number): Promise<Payment> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: createPaymentDto.orderId },
        relations: { buyer: true, payments: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${createPaymentDto.orderId} not found`);
      }

      if (order.buyer.id !== userId) {
        throw new ForbiddenException('You can only submit payments for your own orders');
      }

      if (order.orderStatus === OrderStatus.CANCELLED || order.orderStatus === OrderStatus.COMPLETED) {
        throw new BadRequestException(
          `Cannot submit payment for an order that is ${order.orderStatus}`,
        );
      }

      const alreadyPaid = order.payments?.some((p) => p.paymentStatus === PaymentStatus.PAID);
      if (alreadyPaid) {
        throw new ConflictException('This order has already been paid');
      }

      if (Number(createPaymentDto.amount) !== Number(order.totalAmount)) {
        throw new BadRequestException(
          `Payment amount (${createPaymentDto.amount}) must match order total (${order.totalAmount})`,
        );
      }

      if (createPaymentDto.paymentReference) {
        const existingRef = await manager.findOne(Payment, {
          where: { paymentReference: createPaymentDto.paymentReference },
        });
        if (existingRef) {
          throw new ConflictException('Payment reference has already been used');
        }
      }

      // Default simulated submission to Paid unless explicitly set otherwise
      const status = createPaymentDto.paymentStatus ?? PaymentStatus.PAID;

      const payment = manager.create(Payment, {
        order: { id: order.id } as Order,
        paymentMethod: createPaymentDto.paymentMethod,
        paymentReference: createPaymentDto.paymentReference ?? null,
        amount: createPaymentDto.amount.toFixed(2),
        paymentStatus: status,
      });

      const savedPayment = await manager.save(Payment, payment);

      if (status === PaymentStatus.PAID) {
        order.orderStatus = OrderStatus.CONFIRMED;
        await manager.save(Order, order);
      }

      return savedPayment;
    });
  }

  async findByOrder(orderId: number, userId: number, userRole: UserRole): Promise<Payment[]> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { buyer: true, product: { seller: true } },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const isBuyer = order.buyer.id === userId;
    const isSeller = order.product.seller.id === userId;

    if (!isBuyer && !isSeller && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to view payments for this order');
    }

    return this.paymentsRepository.find({
      where: { order: { id: orderId } },
      order: { createdAt: 'DESC' },
    });
  }
}