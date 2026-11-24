
import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
    role: UserRole;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/v1/users/me
  // Authenticated users can view their own profile.
  @Get('me')
  async getMyProfile(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.findById(
      request.user.userId,
    );

    return {
      message: 'Profile retrieved successfully.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  // PATCH /api/v1/users/me
  // Authenticated users can update their own name and location.
  @Patch('me')
  async updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateProfile(
      request.user.userId,
      updateUserDto,
    );

    return {
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  // GET /api/v1/users
  // Only administrators can retrieve the user list.
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    const users = await this.usersService.findAll();

    return {
      message: 'Users retrieved successfully.',
      users: users.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        location: user.location,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  }
}
