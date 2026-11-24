
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Register a new user.
  async create(
    createUserDto: CreateUserDto,
    passwordHash: string,
  ): Promise<User> {
    const email = createUserDto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists.',
      );
    }

    const user = this.usersRepository.create({
      fullName: createUserDto.fullName.trim(),
      email,
      passwordHash,
      location: createUserDto.location?.trim() || null,
      role: UserRole.USER,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(
          'An account with this email already exists.',
        );
      }

      throw error;
    }
  }

  // Find a user by email.
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  // Find a user by email and explicitly retrieve passwordHash.
  async findByEmailWithPassword(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email: email.trim().toLowerCase(),
      })
      .getOne();
  }

  // Find a user by their ID.
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  // Return all users. Password hashes are excluded by the entity configuration.
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { id: 'ASC' },
    });
  }

  // Update only the profile fields allowed by UpdateUserDto.
  async updateProfile(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.fullName !== undefined) {
      user.fullName = updateUserDto.fullName.trim();
    }

    if (updateUserDto.location !== undefined) {
      user.location = updateUserDto.location.trim() || null;
    }

    return this.usersRepository.save(user);
  }
}
