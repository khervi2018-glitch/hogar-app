import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

interface SendMessagePayload {
  jobId: string;
  contenido: string;
}

@WebSocketGateway({
  cors: {
    origin: '*', // en producción, restringir al dominio real de la app
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

  // chat.gateway.ts
handleConnection(client: Socket) {
  try {
    const token =
      client.handshake.auth?.token ||                          // socket.io-client (React Native, web)
      (client.handshake.query?.token as string) ||             // Postman via Params
      client.handshake.headers?.authorization?.replace('Bearer ', ''); // Postman via Headers

    if (!token) {
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET, // o como lo tengas configurado
    });

    // Guarda el usuario en el socket para usarlo en sendMessage
    client.data.user = payload;
  } catch (e) {
    client.disconnect();
  }
}

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('joinJob')
  handleJoinJob(
    @MessageBody() data: { jobId: string }, //jobId: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Cada Job tiene su propia "sala" — así los mensajes solo llegan
    // a quienes están viendo ese trabajo específico
    client.join(`job:${data.jobId}`);
    this.logger.log(`Cliente ${client.id} se unió a job:${data.jobId}`);
    return { event: 'joinedJob', jobId: data.jobId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
     @MessageBody() data: { jobId: string; contenido: string },
  ) {
    const user = client.data.user;

    const senderId =  user.sub ?? user.id; //client.data.userId;

    const message = await this.chatService.saveMessage({
    jobId: data.jobId,
    senderId,
    contenido: data.contenido,
  });

    // Emitimos el mensaje a todos los conectados a esa sala (incluido quien lo mandó,
    // para que su propia app también lo muestre de vuelta confirmado)
    // 4. Emitir a la sala
    this.server.to(`job:${data.jobId}`).emit('newMessage', message);

    return message;
  }
}