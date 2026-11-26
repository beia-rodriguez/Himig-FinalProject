import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  @IsPositive()
  receiverId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  messageContent: string;
}