import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createMessageDto: CreateMessageDto, senderId: number): Promise<Message> {
    const { receiverId, messageContent } = createMessageDto;

    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    const receiver = await this.usersRepository.findOne({ where: { id: receiverId } });
    if (!receiver) {
      throw new NotFoundException(`Recipient user #${receiverId} not found`);
    }

    const message = this.messagesRepository.create({
      sender: { id: senderId } as User,
      receiver: { id: receiverId } as User,
      messageContent,
    });

    return this.messagesRepository.save(message);
  }

  async getConversation(userId: number, otherUserId: number): Promise<Message[]> {
    const otherUser = await this.usersRepository.findOne({ where: { id: otherUserId } });
    if (!otherUser) {
      throw new NotFoundException(`User #${otherUserId} not found`);
    }

    return this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(sender.id = :userId AND receiver.id = :otherUserId) OR (sender.id = :otherUserId AND receiver.id = :userId)',
        { userId, otherUserId },
      )
      .orderBy('message.sentAt', 'ASC')
      .getMany();
  }
}