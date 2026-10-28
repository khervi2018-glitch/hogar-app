import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Job } from '../jobs/entities/job.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messagesRepo: Repository<ChatMessage>,
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
  ) {}

  async saveMessage(data: { jobId: string; senderId: string; contenido: string }) {
  const message = this.messagesRepo.create({
    jobId: data.jobId,
    senderId: data.senderId,
    contenido: data.contenido,
  });
  return this.messagesRepo.save(message);
  }

  async getHistory(jobId: string) {
    return this.messagesRepo.find({
      where: { jobId },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
    });
  }
}