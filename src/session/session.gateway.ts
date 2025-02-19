import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import JoinSessionDTO from 'src/ressource/joinSession.ressource';
import { SessionService } from './session.service';

@WebSocketGateway()
export class SessionsGateway {
  constructor(private readonly sessionService: SessionService) {}

  @SubscribeMessage('joinSession')
  handleJoin(
    @MessageBody() joinSessionDTO: JoinSessionDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.sessionService.joinSession(joinSessionDTO);
    // Émettre à tous les clients connectés (ou à la salle correspondant à la session) l'update
    client.broadcast.emit('sessionUpdated', session);
    return session;
  }
}
