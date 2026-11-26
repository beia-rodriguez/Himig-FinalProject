import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trade } from './entities/trade.entity';
import { Product } from '../products/entities/product.entity';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trade, Product])],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TradesService],
})
export class TradesModule {}