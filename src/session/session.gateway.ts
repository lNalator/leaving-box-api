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
  pingInterval: 10000,
  pingTimeout: 5000,
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

    const clientsInfo = clients.map((socket) => ({
      id: socket.id,
      rooms: Array.from(socket.rooms),
    }));

    for (const client of clientsInfo) {
      console.log('Client in room', data.sessionCode, client.id);
    }

    if (client.rooms.has(data.sessionCode)) {
      client.emit('currentSession', {
        sessionCode: data.sessionCode,
        connectedClients: clientsInfo,
      });
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
    @MessageBody() joinSessionDTO: JoinSessionDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const rooms = client.rooms;
    for (let room in rooms) {
      if (room !== client.id) client.leave(room);
    }
    client.join(joinSessionDTO.sessionCode);
    this.server.to(joinSessionDTO.sessionCode).emit('playerJoined');
  }

  // /**
  //  * Démarre un timer pour une session donnée.
  //  * @param sessionId L'identifiant de la session (utilisé comme "room" sur Socket.IO)
  //  * @param durationInSeconds Durée du timer en secondes (par exemple, 600 pour 10 minutes)
  //  */
  // startGameTimer(sessionId: string, durationInSeconds: number) {
  //   let remaining = durationInSeconds;

  //   this.server.to(sessionId).emit('timerUpdate', { remaining });

  //   const interval = setInterval(() => {
  //     remaining--;
  //     this.server.to(sessionId).emit('timerUpdate', { remaining });

  //     if (remaining <= 0) {
  //       clearInterval(interval);
  //       delete this.sessionTimers[sessionId];
  //       this.server
  //         .to(sessionId)
  //         .emit('gameOver', { message: 'Le temps est écoulé !' });
  //     }
  //   }, 1000);

  //   this.sessionTimers[sessionId] = interval;
  // }

  // /**
  //  * Message pour démarrer le timer depuis le client.
  //  * Par exemple, l'agent peut envoyer ce message pour démarrer la partie.
  //  */
  // @SubscribeMessage('startTimer')
  // handleStartTimer(
  //   @MessageBody() data: { sessionId: string; duration: number },
  // ) {
  //   // Démarre le timer pour la session avec la durée spécifiée (en secondes)
  //   this.startGameTimer(data.sessionId, data.duration);
  //   return { message: 'Timer démarré' };
  // }
}
