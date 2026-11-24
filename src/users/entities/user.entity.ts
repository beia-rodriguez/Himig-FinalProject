import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { Trade } from '../../trades/entities/trade.entity';
import { Message } from '../../messages/entities/message.entity';
import { Review } from '../../reviews/entities/review.entity';

export enum UserRole { USER = 'user', ADMIN = 'admin' }

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // Never serialize this property in API responses. Use response DTOs/select:false.
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  location: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => Product, (product) => product.seller) products: Product[];
  @OneToMany(() => Order, (order) => order.buyer) orders: Order[];
  @OneToMany(() => Trade, (trade) => trade.proposer) proposedTrades: Trade[];
  @OneToMany(() => Message, (message) => message.sender) sentMessages: Message[];
  @OneToMany(() => Message, (message) => message.receiver) receivedMessages: Message[];
  @OneToMany(() => Review, (review) => review.reviewer) reviews: Review[];
}
