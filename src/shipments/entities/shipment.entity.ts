import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum ShippingStatus { PENDING = 'Pending', SHIPPED = 'Shipped', IN_TRANSIT = 'In Transit', DELIVERED = 'Delivered' }

@Entity({ name: 'shipments' })
export class Shipment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @OneToOne(() => Order, (order) => order.shipment, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @Column({ name: 'courier_name', type: 'varchar', length: 50 })
  courierName: string;

  @Column({ name: 'tracking_number', type: 'varchar', length: 100, nullable: true, unique: true })
  trackingNumber: string | null;

  @Column({ name: 'shipping_status', type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  shippingStatus: ShippingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
