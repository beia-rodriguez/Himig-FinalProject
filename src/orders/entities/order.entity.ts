import {
  Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany,
  OneToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum OrderStatus { PENDING = 'Pending', CONFIRMED = 'Confirmed', COMPLETED = 'Completed', CANCELLED = 'Cancelled' }

@Entity({ name: 'orders' })
@Check('CHK_orders_total_nonnegative', '`total_amount` >= 0')
export class Order {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'buyer_id', referencedColumnName: 'id' })
  buyer: User;

  @ManyToOne(() => Product, (product) => product.orders, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @Column({ name: 'order_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: string;

  @Column({ name: 'delivery_address', type: 'text' })
  deliveryAddress: string;

  @Column({ name: 'order_status', type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  orderStatus: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Payment, (payment) => payment.order) payments: Payment[];
  @OneToOne(() => Shipment, (shipment) => shipment.order) shipment: Shipment | null;
  @OneToOne(() => Review, (review) => review.order) review: Review | null;
}
