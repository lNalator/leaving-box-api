import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SessionService } from './session.service';
import { ModuleService } from 'src/game/modules/module.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
  },
})
export class SessionsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly sessionService: SessionService,
    private readonly moduleService: ModuleService,
  ) {}

  // Objet pour stocker les intervalles de timer par session
  private readonly sessionTimers: { [sessionCode: string]: NodeJS.Timeout } =
    {};

  @SubscribeMessage('createSession')
  async handleCreateSession(
    @MessageBody()
    data: { difficulty: 'Easy' | 'Medium' | 'Hard' },
    @ConnectedSocket() client: Socket,
  ) {
    // TODO : ADD AGENT JOINING THE REDIS SESSION
    try {
      const session = await this.sessionService.createSession({
        difficulty: data.difficulty,
        agentId: client.id,
      });
      // Remove other rooms except the socket's own id.
      for (const room of client.rooms) {
        if (room !== client.id) {
          await this.sessionService.deleteSession(room)
          client.leave(room)
        };
      }
      client.join(session.code);
      client.emit('sessionCreated', session);
    } catch (error) {
      client.emit('error', { message: 'Failed to create session' });
    }
  }

  @SubscribeMessage('getSession')
  async handleGetSessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionCode: string },
  ) {
    const sessionData = await this.sessionService.getSession(data.sessionCode);

    if (!sessionData) {
      return {
        success: false,
        message: `Session with code ${data.sessionCode} does not exist`,
      };
    }

    const clients = await this.server.in(data.sessionCode).fetchSockets();
    const clientsInfo = clients.map((socket) => ({
      id: socket.id,
      rooms: Array.from(socket.rooms),
    }));

    if (client.rooms.has(data.sessionCode)) {
      client.emit('currentSession', {
        sessionCode: data.sessionCode,
        sessionData,
        connectedClients: clientsInfo,
      });
    }

    return { success: true };
  }

  @SubscribeMessage('joinSession')
  async handleJoin(
    @MessageBody() data: { sessionCode: string; player: string },
    @ConnectedSocket() client: Socket,
  ) {
    const rooms = client.rooms;
    for (const room of rooms) {
      if (room !== client.id) {
        client.leave(room);
      }
    }
    client.join(data.sessionCode);

    const session = await this.sessionService.addPlayerToSession(
      data.sessionCode,
      data.player,
    );
    if (!session) {
      return {
        success: false,
        message: `Session with code ${data.sessionCode} does not exist`,
      };
    }

    this.server.to(data.sessionCode).emit('playerJoined', {
      player: data.player,
      session,
    });

    return { success: true };
  }

  @SubscribeMessage('startGame')
  async handleStartGame(
    @MessageBody() data: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const session = await this.sessionService.getSession(data.sessionCode);
    if (!session) {
      return {
        success: false,
        message: `Session with code ${data.sessionCode} does not exist`,
      };
    }

    this.sessionService.updateSession(data.sessionCode, {
      started: true,
    });
    const moduleManuals = await this.moduleService.findSome(5);

    this.server
      .to(data.sessionCode)
      .emit('gameStarted', { session, moduleManuals });

    return { success: true };
  }

  @SubscribeMessage('leaveSession')
  async handleLeave(
    @MessageBody() data: { sessionCode: string; player: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Supprime le joueur de la session dans Redis
    const session = await this.sessionService.removePlayerFromSession(
      data.sessionCode,
      data.player,
    );
    if (!session) {
      return {
        success: false,
        message: `Session with code ${data.sessionCode} does not exist`,
      };
    }

    // Le client quitte la salle correspondant à la session
    client.leave(data.sessionCode);

    // Informe tous les clients de la salle que le joueur a quitté
    this.server.to(data.sessionCode).emit('playerLeft', {
      player: data.player,
      session,
    });

    return { success: true };
  }

  @SubscribeMessage('clearSession')
  async handleClearSession(
    @MessageBody() data: { sessionCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('sessionCleared', data);
      await this.sessionService.deleteSession(data.sessionCode);
      this.server
        .to(data.sessionCode)
        .emit('sessionCleared', { sessionCode: data.sessionCode });
      this.stopGameTimer(data.sessionCode);
      this.server.to(data.sessionCode).socketsLeave(data.sessionCode);

      return { success: true };
    } catch (error) {
      console.log('error', error);
      return { success: false, message: 'Failed to clear session' };
    }
  }

  @SubscribeMessage('startTimer')
  async handleStartTimer(
    @MessageBody() data: { sessionCode: string; duration: number },
  ) {
    // Démarre le timer pour la session avec la durée spécifiée (en secondes)
    await this.sessionService.updateTimer(data.sessionCode, data.duration);
    this.startGameTimer(data.sessionCode, data.duration);
  }

  @SubscribeMessage('stopTimer')
  handleStopTimer(@MessageBody() data: { sessionCode: string }) {
    this.stopGameTimer(data.sessionCode);
  }

  async startGameTimer(sessionCode: string, durationInSeconds: number) {
    let remaining = durationInSeconds;

    this.server.to(sessionCode).emit('timerUpdate', { remaining });

    const interval = setInterval(async () => {
      remaining--;
      console.log('Remaining time:', remaining, ' for session : ', sessionCode);

      // Met à jour Redis avec le temps restant
      await this.sessionService.updateTimer(sessionCode, remaining);

      this.server.to(sessionCode).emit('timerUpdate', { remaining });

      if (remaining <= 0) {
        clearInterval(interval);
        delete this.sessionTimers[sessionCode];
        this.server
          .to(sessionCode)
          .emit('gameOver', { message: 'Le temps est écoulé !' });
        await this.sessionService.updateTimer(sessionCode, 0);
      }
    }, 1000);

    this.sessionTimers[sessionCode] = interval;
  }

  async stopGameTimer(sessionCode: string) {
    if (this.sessionTimers[sessionCode]) {
      clearInterval(this.sessionTimers[sessionCode]);
      delete this.sessionTimers[sessionCode];
      await this.sessionService.updateTimer(sessionCode, 0);
      this.server.to(sessionCode).emit('timerStopped', { sessionCode });
    }
  }
}
