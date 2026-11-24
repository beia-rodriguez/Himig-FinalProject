import {
  Check, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod { GCASH = 'GCash', MAYA = 'Maya', BANK_TRANSFER = 'Bank Transfer' }
export enum PaymentStatus { PENDING = 'Pending', PAID = 'Paid', FAILED = 'Failed', REFUNDED = 'Refunded' }

@Entity({ name: 'payments' })
@Check('CHK_payments_amount_positive', '`amount` > 0')
@Index('IDX_payments_order_id', ['order'])
export class Payment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => Order, (order) => order.payments, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_reference', type: 'varchar', length: 150, nullable: true, unique: true })
  paymentReference: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
