import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Order } from './orders/entities/order.entity';
import { Payment } from './payments/entities/payment.entity';
import { Shipment } from './shipments/entities/shipment.entity';
import { Trade } from './trades/entities/trade.entity';
import { Message } from './messages/entities/message.entity';
import { Review } from './reviews/entities/review.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { TradesModule } from './trades/trades.module';
import { MessagesModule } from './messages/messages.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '3306')),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'himig_db'),
        charset: 'utf8mb4',
        entities: [User, Product, Order, Payment, Shipment, Trade, Message, Review],
        synchronize: false,
        migrationsRun: false,
        logging: config.get<string>('NODE_ENV') === 'development'
          ? ['error', 'warn']
          : ['error'],
        timezone: '+00:00',
      }),
    }),

    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    ShipmentsModule,
    TradesModule,
    MessagesModule,
    ReviewsModule,
  ],
})
export class AppModule {}