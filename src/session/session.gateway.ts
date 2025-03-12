import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import JoinSessionDTO from 'src/ressource/joinSession.ressource';
import { SessionService } from './session.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly sessionService: SessionService) {}

  // Objet pour stocker les intervalles de timer par session
  private readonly sessionTimers: { [sessionId: string]: NodeJS.Timeout } = {};

  @SubscribeMessage('getSession')
  async handleGetSessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string },
  ) {
    const clients = await this.server.in(data.sessionCode).fetchSockets();

    if (clients.length <= 0) {
      return {
        success: false,
        message: 'Session with code ' + data.sessionCode + ' does not exist',
      };
    } else {
      const clientsInfo = clients.map((socket) => ({
        id: socket.id,
        rooms: Array.from(socket.rooms),
      }));

      if (client.rooms.has(data.sessionCode)) {
        client.emit('currentSession', {
          sessionCode: data.sessionCode,
          connectedClients: clientsInfo,
        });
      }
      return { success: true };
    }
  }

  @SubscribeMessage('createSession')
  handleCreateSession(
    @MessageBody()
    data: { difficulty: 'Easy' | 'Medium' | 'Hard' },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.sessionService.createSession(data);
    const rooms = client.rooms;
    for (let room in rooms) {
      if (room !== client.id) client.leave(room);
    }
    client.join(session.code);
    client.emit('sessionCreated', session);
  }

  @SubscribeMessage('joinSession')
  handleJoin(
    @MessageBody() data: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const rooms = client.rooms;
    for (let room in rooms) {
      if (room !== client.id) client.leave(room);
    }
    client.join(data.sessionCode);
    this.server.to(data.sessionCode).emit('playerJoined');
  }

  @SubscribeMessage('leaveSession')
  handleLeave(
    @MessageBody() data: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.sessionCode);
  }

  @SubscribeMessage('clearSession')
  handleClearSession(
    @MessageBody() data: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('sessionCleared', data);

      this.server
        .to(data.sessionCode)
        .emit('sessionCleared', { sessionId: data.sessionCode });
      this.server.to(data.sessionCode).socketsLeave(data.sessionCode);
      return { success: true };
    } catch (error) {
      console.log('error', error);
      return { success: false };
    }
  }

  @SubscribeMessage('startTimer')
  handleStartTimer(
    @MessageBody() data: { sessionId: string; duration: number },
  ) {
    // Démarre le timer pour la session avec la durée spécifiée (en secondes)
    this.startGameTimer(data.sessionId, data.duration);
  }

  @SubscribeMessage('stopTimer')
  handleStopTimer(@MessageBody() data: { sessionId: string }) {
    this.stopGameTimer(data.sessionId);
  }

  startGameTimer(sessionId: string, durationInSeconds: number) {
    let remaining = durationInSeconds;

    this.server.to(sessionId).emit('timerUpdate', { remaining });

    const interval = setInterval(() => {
      remaining--;
      this.server.to(sessionId).emit('timerUpdate', { remaining });

      if (remaining <= 0) {
        clearInterval(interval);
        delete this.sessionTimers[sessionId];
        this.server
          .to(sessionId)
          .emit('gameOver', { message: 'Le temps est écoulé !' });
      }
    }, 1000);

    this.sessionTimers[sessionId] = interval;
  }

  stopGameTimer(sessionId: string) {
    if (this.sessionTimers[sessionId]) {
      clearInterval(this.sessionTimers[sessionId]);
      delete this.sessionTimers[sessionId];
      // Vous pouvez également informer la room que le timer est stoppé
      this.server.to(sessionId).emit('timerStopped', { sessionId });
    }
  }
}
