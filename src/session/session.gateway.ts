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
  private sessionTimers: { [sessionId: string]: NodeJS.Timeout } = {};

  /**
   * Message pour créer une nouvelle session.
   * L'agent peut envoyer ce message pour créer une nouvelle session.
   * @param data l'identifiant de l'agent pour créer la session
   */
  @SubscribeMessage('createSession')
  handleCreateSession(@MessageBody() data: { agentId: string }) {
    const session = this.sessionService.createSession(data);
    this.server.to(session.id).emit('sessionCreated', session);
    return { session, message: 'Session created' };
  }

  /**
   * Démarre un timer pour une session donnée.
   * @param sessionId L'identifiant de la session (utilisé comme "room" sur Socket.IO)
   * @param durationInSeconds Durée du timer en secondes (par exemple, 600 pour 10 minutes)
   */
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

  /**
   * Permet à un client de rejoindre une session et d'être ajouté à la "room" correspondante.
   */
  @SubscribeMessage('joinSession')
  handleJoin(
    @MessageBody() joinSessionDTO: JoinSessionDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.sessionService.joinSession(joinSessionDTO);
    if (session) {
      client.join(session.id);
      // Émettre à tous les clients connectés (ou à la salle correspondant à la session) l'update
      // client.broadcast.emit('sessionUpdated', session);

      this.server
        .to(session.id)
        .emit('playerJoined', { playerId: joinSessionDTO.operatorId });
      return { session, message: 'Session joined' };
    } else {
      return {
        session: null,
        message: 'Session not found or operator already joined',
      };
    }
  }

  /**
   * Message pour démarrer le timer depuis le client.
   * Par exemple, l'agent peut envoyer ce message pour démarrer la partie.
   */
  @SubscribeMessage('startTimer')
  handleStartTimer(
    @MessageBody() data: { sessionId: string; duration: number },
  ) {
    // Démarre le timer pour la session avec la durée spécifiée (en secondes)
    this.startGameTimer(data.sessionId, data.duration);
    return { message: 'Timer démarré' };
  }
}
