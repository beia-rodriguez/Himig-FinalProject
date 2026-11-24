import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'messages' })
@Index('IDX_messages_sender_receiver_sent_at', ['sender', 'receiver', 'sentAt'])
export class Message {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'receiver_id', referencedColumnName: 'id' })
  receiver: User;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @CreateDateColumn({ name: 'sent_at', type: 'datetime' })
  sentAt: Date;
}
