import {
  Check, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn,
  Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Trade } from '../../trades/entities/trade.entity';

export enum ProductStatus {
  AVAILABLE = 'Available', RESERVED = 'Reserved', SOLD = 'Sold', TRADED = 'Traded',
}

@Entity({ name: 'products' })
@Check('CHK_products_price_nonnegative', '`price` >= 0')
@Index('IDX_products_seller_id', ['seller'])
@Index('IDX_products_status_category', ['productStatus', 'category'])
export class Product {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.products, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seller_id', referencedColumnName: 'id' })
  seller: User;

  @Column({ name: 'artist_name', type: 'varchar', length: 150 })
  artistName: string;

  @Column({ name: 'product_name', type: 'varchar', length: 150 })
  productName: string;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ name: 'item_condition', type: 'varchar', length: 50 })
  itemCondition: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'product_status', type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  productStatus: ProductStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Order, (order) => order.product) orders: Order[];
  @OneToMany(() => Trade, (trade) => trade.offeredProduct) offeredTrades: Trade[];
  @OneToMany(() => Trade, (trade) => trade.requestedProduct) requestedTrades: Trade[];
}
