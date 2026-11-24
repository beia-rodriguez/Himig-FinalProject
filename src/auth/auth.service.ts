import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private toSafeUser(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      location: user.location,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async register(registerDto: RegisterDto) {
    // bcrypt only processes up to 72 bytes of a password.
    if (Buffer.byteLength(registerDto.password, 'utf8') > 72) {
      throw new BadRequestException(
        'Password must not exceed 72 bytes.',
      );
    }

    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ?? 12,
    );

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      saltRounds,
    );

    const user = await this.usersService.create(
      registerDto,
      passwordHash,
    );

    return {
      message: 'Account registered successfully.',
      user: this.toSafeUser(user),
    };
  }

  async login(loginDto: LoginDto) {
    if (Buffer.byteLength(loginDto.password, 'utf8') > 72) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: this.toSafeUser(user),
    };
  }
}