import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Endpoint 24: Protected - Send a direct message to another user
  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Request() req: any) {
    return this.messagesService.create(createMessageDto, req.user.userId);
  }

  // Endpoint 25: Protected - View conversation thread with a specific user
  @Get('conversation/:userId')
  getConversation(
    @Param('userId', ParseIntPipe) otherUserId: number,
    @Request() req: any,
  ) {
    return this.messagesService.getConversation(req.user.userId, otherUserId);
  }
}