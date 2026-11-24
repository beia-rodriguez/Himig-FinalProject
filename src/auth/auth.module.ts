import { SignOptions } from 'jsonwebtoken';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const expiresIn =
        configService.get<string>('JWT_EXPIRES_IN') ?? '1d';

        return {
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
            expiresIn: expiresIn as SignOptions['expiresIn'],
        },
        };
    },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}