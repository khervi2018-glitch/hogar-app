import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

const MAX_MENSAJE = 1000;

@WebSocketGateway({
  cors: {
    origin: '*', // en producción, restringir al dominio real de la app (pendiente S3)
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || // socket.io-client (React Native, web)
        (client.handshake.query?.token as string) || // Postman via Params
        client.handshake.headers?.authorization?.replace('Bearer ', ''); // Postman via Headers

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Guardamos el usuario en el socket para los demas eventos
      client.data.user = payload;
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  private getUserId(client: Socket): string {
    const user = client.data.user;
    const userId = user?.sub ?? user?.id;
    if (!userId) {
      throw new WsException('No autenticado');
    }
    return userId;
  }

  @SubscribeMessage('joinJob')
  async handleJoinJob(
    @MessageBody() data: { jobId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserId(client);

    try {
      // Solo el cliente o el tecnico del trabajo pueden entrar a su sala
      await this.chatService.assertParticipant(data?.jobId, userId);
    } catch (e) {
      this.logger.warn(`Usuario ${userId} intentó unirse a job:${data?.jobId} sin permiso`);
      return { event: 'joinError', message: 'No participas en este trabajo' };
    }

    client.join(`job:${data.jobId}`);
    this.logger.log(`Cliente ${client.id} se unió a job:${data.jobId}`);
    return { event: 'joinedJob', jobId: data.jobId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; contenido: string },
  ) {
    const userId = this.getUserId(client);

    // Solo puede escribir quien ya entro a la sala (y entrar ya exige ser participante)
    if (!data?.jobId || !client.rooms.has(`job:${data.jobId}`)) {
      throw new WsException('No estás en la sala de este trabajo');
    }

    const contenido = (data.contenido ?? '').trim();
    if (!contenido || contenido.length > MAX_MENSAJE) {
      throw new WsException(`El mensaje debe tener entre 1 y ${MAX_MENSAJE} caracteres`);
    }

    const message = await this.chatService.saveMessage({
      jobId: data.jobId,
      senderId: userId,
      contenido,
    });

    // A todos los de la sala (incluido quien lo mando, como confirmacion)
    this.server.to(`job:${data.jobId}`).emit('newMessage', message);
    return message;
  }
}