import { Injectable } from '@nestjs/common';
import { Session } from 'src/interface/session.interface';
import ClearSessionDTO from 'src/ressource/clearSession.ressource';
import CreateSessionDto from 'src/ressource/createSession.ressource';
import JoinSessionDTO from 'src/ressource/joinSession.ressource';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private readonly sessions: Session[] = [];

  createSession({ agentId }: CreateSessionDto): Session {
    const code = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    const newSession: Session = {
      id: uuidv4(),
      code: code,
      agentId: agentId,
      operatorIds: [],
      createdAt: new Date(),
    };
    this.sessions.push(newSession);
    return newSession;
  }

  joinSession({ sessionCode, operatorId }: JoinSessionDTO) {
    const session = this.sessions.find((s) => s.code === sessionCode);
    if (session && !session.operatorIds.includes(operatorId)) {
      session.operatorIds.push(operatorId);
      return session;
    }
    return null;
  }

  clearSession({ sessionId }: ClearSessionDTO) {
    const index = this.sessions.findIndex((s) => s.id === sessionId);
    if (index === -1) {
      return false;
    }
    this.sessions.splice(index, 1);
    return true;
  }
}
