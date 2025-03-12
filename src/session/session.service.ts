import { Injectable } from '@nestjs/common';
import { Session } from 'src/interface/session.interface';
import ClearSessionDTO from 'src/ressource/clearSession.ressource';
import CreateSessionDto from 'src/ressource/createSession.ressource';
import JoinSessionDTO from 'src/ressource/joinSession.ressource';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private readonly sessions: Session[] = [];

  // getSessionById(sessionId: string): Session | undefined {
  //   console.log(this.getSessions());
  //   const session = this.sessions.find((s) => s.id === sessionId);
  //   console.log('getSessionById', session);
  //   return session;
  // }

  // getSessions(): Session[] {
  //   return this.sessions;
  // }

  createSession({ difficulty }: CreateSessionDto): Session {
    const code = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    let maxTime = 600000;
    if (difficulty === 'Easy') {
      maxTime = 900000;
    }
    if (difficulty === 'Medium') {
      maxTime = 600000;
    }
    if (difficulty === 'Hard') {
      maxTime = 480000;
    }
    const newSession: Session = {
      id: uuidv4(),
      code: code,
      maxTime: maxTime,
      createdAt: new Date(),
    };
    return newSession;
  }

  // joinSession({ sessionCode, operatorId }: JoinSessionDTO) {
  //   console.log(this.getSessions());

  //   const session = this.sessions.find((s) => s.code === sessionCode);
  //   if (session && !session.operatorIds.includes(operatorId)) {
  //     session.operatorIds.push(operatorId);
  //     return session;
  //   }
  //   return null;
  // }

  // clearSession({ sessionId }: ClearSessionDTO) {
  //   const index = this.sessions.findIndex((s) => s.id === sessionId);
  //   if (index === -1) {
  //     return false;
  //   }
  //   this.sessions.splice(index, 1);
  //   return true;
  // }
}
