import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: number): Promise<Review> {
    const { orderId, rating, comment } = createReviewDto;

    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { buyer: true, review: true },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (order.buyer.id !== reviewerId) {
      throw new ForbiddenException('Only the buyer of this order can leave a review');
    }

    if (order.orderStatus !== OrderStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed orders');
    }

    if (order.review) {
      throw new ConflictException('A review has already been submitted for this order');
    }

    const review = this.reviewsRepository.create({
      order: { id: orderId } as Order,
      reviewer: { id: reviewerId } as User,
      rating,
      comment: comment ?? null,
    });

    return this.reviewsRepository.save(review);
  }

  async findBySeller(sellerId: number): Promise<{
    sellerId: number;
    totalReviews: number;
    averageRating: number;
    reviews: Review[];
  }> {
    const reviews = await this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('review.order', 'order')
      .leftJoinAndSelect('order.product', 'product')
      .leftJoin('product.seller', 'seller')
      .where('seller.id = :sellerId', { sellerId })
      .orderBy('review.createdAt', 'DESC')
      .getMany();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews
            ).toFixed(2),
          )
        : 0;

    return {
      sellerId,
      totalReviews,
      averageRating,
      reviews,
    };
  }
}