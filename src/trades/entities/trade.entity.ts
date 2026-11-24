import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum TradeStatus { PENDING = 'Pending', ACCEPTED = 'Accepted', REJECTED = 'Rejected', COMPLETED = 'Completed', CANCELLED = 'Cancelled' }

@Entity({ name: 'trades' })
@Check('CHK_trades_different_products', '`offered_product_id` <> `requested_product_id`')
export class Trade {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => Product, (product) => product.offeredTrades, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'offered_product_id', referencedColumnName: 'id' })
  offeredProduct: Product;

  @ManyToOne(() => Product, (product) => product.requestedTrades, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'requested_product_id', referencedColumnName: 'id' })
  requestedProduct: Product;

  @ManyToOne(() => User, (user) => user.proposedTrades, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proposer_id', referencedColumnName: 'id' })
  proposer: User;

  @Column({ name: 'trade_status', type: 'enum', enum: TradeStatus, default: TradeStatus.PENDING })
  tradeStatus: TradeStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
