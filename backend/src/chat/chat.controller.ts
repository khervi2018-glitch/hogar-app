import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Forma de request.user segun JwtStrategy.validate()
type AuthRequest = { user: { userId: string; email: string; tipo: string } };

const ROLES_VISTA = ['cliente', 'tecnico'];

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Mis conversaciones, como cliente o como tecnico' })
  @ApiQuery({ name: 'rol', enum: ROLES_VISTA })
  @Get('conversations')
  getConversations(@Query('rol') rol: string, @Req() req: AuthRequest) {
    if (!ROLES_VISTA.includes(rol)) {
      throw new BadRequestException('rol debe ser cliente o tecnico');
    }
    return this.chatService.getConversations(req.user.userId, rol as 'cliente' | 'tecnico');
  }

  @ApiOperation({ summary: 'Historial de mensajes de un trabajo (solo participantes)' })
  @Get(':jobId/messages')
  getHistory(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Req() req: AuthRequest,
  ) {
    return this.chatService.getHistory(jobId, req.user.userId);
  }
}