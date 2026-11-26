import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Trade, TradeStatus } from './entities/trade.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeStatusDto } from './dto/update-trade-status.dto';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private readonly tradesRepository: Repository<Trade>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createTradeDto: CreateTradeDto, proposerId: number): Promise<Trade> {
    const { offeredProductId, requestedProductId } = createTradeDto;

    if (offeredProductId === requestedProductId) {
      throw new BadRequestException('You cannot trade a product for itself');
    }

    const offeredProduct = await this.productsRepository.findOne({
      where: { id: offeredProductId },
      relations: { seller: true },
    });
    if (!offeredProduct) {
      throw new NotFoundException(`Offered product #${offeredProductId} not found`);
    }

    const requestedProduct = await this.productsRepository.findOne({
      where: { id: requestedProductId },
      relations: { seller: true },
    });
    if (!requestedProduct) {
      throw new NotFoundException(`Requested product #${requestedProductId} not found`);
    }

    if (offeredProduct.seller.id !== proposerId) {
      throw new ForbiddenException('You can only offer your own product for trade');
    }

    if (requestedProduct.seller.id === proposerId) {
      throw new BadRequestException('You cannot propose a trade for your own product');
    }

    if (offeredProduct.productStatus !== ProductStatus.AVAILABLE) {
      throw new BadRequestException('Your offered product is no longer available');
    }

    if (requestedProduct.productStatus !== ProductStatus.AVAILABLE) {
      throw new BadRequestException('The requested product is no longer available');
    }

    const trade = this.tradesRepository.create({
      offeredProduct: { id: offeredProductId } as Product,
      requestedProduct: { id: requestedProductId } as Product,
      proposer: { id: proposerId } as User,
      tradeStatus: TradeStatus.PENDING,
    });

    return this.tradesRepository.save(trade);
  }

  async findMyTrades(userId: number): Promise<Trade[]> {
    return this.tradesRepository
      .createQueryBuilder('trade')
      .leftJoinAndSelect('trade.proposer', 'proposer')
      .leftJoinAndSelect('trade.offeredProduct', 'offeredProduct')
      .leftJoinAndSelect('offeredProduct.seller', 'offeredSeller')
      .leftJoinAndSelect('trade.requestedProduct', 'requestedProduct')
      .leftJoinAndSelect('requestedProduct.seller', 'requestedSeller')
      .where('proposer.id = :userId OR requestedSeller.id = :userId', { userId })
      .orderBy('trade.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(
    id: number,
    updateDto: UpdateTradeStatusDto,
    userId: number,
    userRole: string,
  ): Promise<Trade> {
    const trade = await this.tradesRepository.findOne({
      where: { id },
      relations: {
        proposer: true,
        offeredProduct: { seller: true },
        requestedProduct: { seller: true },
      },
    });

    if (!trade) {
      throw new NotFoundException(`Trade #${id} not found`);
    }

    const isProposer = trade.proposer.id === userId;
    const isReceiver = trade.requestedProduct.seller.id === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isProposer && !isReceiver && !isAdmin) {
      throw new ForbiddenException('You are not a participant in this trade');
    }

    const nextStatus = updateDto.tradeStatus;

    if (nextStatus === TradeStatus.CANCELLED && !isProposer && !isAdmin) {
      throw new ForbiddenException('Only the trade proposer can cancel this trade');
    }

    if (
      (nextStatus === TradeStatus.ACCEPTED || nextStatus === TradeStatus.REJECTED) &&
      !isReceiver &&
      !isAdmin
    ) {
      throw new ForbiddenException('Only the requested item owner can accept or reject this trade');
    }

    return this.dataSource.transaction(async (manager) => {
      trade.tradeStatus = nextStatus;

      if (nextStatus === TradeStatus.ACCEPTED) {
        trade.offeredProduct.productStatus = ProductStatus.RESERVED;
        trade.requestedProduct.productStatus = ProductStatus.RESERVED;
        await manager.save(Product, [trade.offeredProduct, trade.requestedProduct]);
      } else if (nextStatus === TradeStatus.COMPLETED) {
        trade.offeredProduct.productStatus = ProductStatus.TRADED;
        trade.requestedProduct.productStatus = ProductStatus.TRADED;
        await manager.save(Product, [trade.offeredProduct, trade.requestedProduct]);
      } else if (
        nextStatus === TradeStatus.REJECTED ||
        nextStatus === TradeStatus.CANCELLED
      ) {
        if (trade.offeredProduct.productStatus === ProductStatus.RESERVED) {
          trade.offeredProduct.productStatus = ProductStatus.AVAILABLE;
        }
        if (trade.requestedProduct.productStatus === ProductStatus.RESERVED) {
          trade.requestedProduct.productStatus = ProductStatus.AVAILABLE;
        }
        await manager.save(Product, [trade.offeredProduct, trade.requestedProduct]);
      }

      return manager.save(Trade, trade);
    });
  }
}