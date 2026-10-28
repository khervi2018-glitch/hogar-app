import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':jobId/messages')
  getHistory(@Param('jobId', ParseUUIDPipe) jobId: string) {
    return this.chatService.getHistory(jobId);
  }
}