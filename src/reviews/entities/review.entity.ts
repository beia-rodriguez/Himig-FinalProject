import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'reviews' })
@Check('CHK_reviews_rating_range', '`rating` BETWEEN 1 AND 5')
export class Review {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @OneToOne(() => Order, (order) => order.review, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => User, (user) => user.reviews, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reviewer_id', referencedColumnName: 'id' })
  reviewer: User;

  @Column({ type: 'tinyint', unsigned: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
