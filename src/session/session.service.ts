import { Injectable } from '@nestjs/common';
import { Session } from 'src/session/interface/session.interface';
import { RedisService } from 'src/session/redis/redis.service';
import ClearSessionDTO from 'src/session/ressource/clearSession.ressource';
import CreateSessionDto from 'src/session/ressource/createSession.ressource';
import JoinSessionDTO from 'src/session/ressource/joinSession.ressource';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async createSession({ difficulty, agentId }: CreateSessionDto): Promise<Session> {
    const code = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
    let maxTime = 900;
    if (difficulty === 'Easy') {
      maxTime = 900;
    }
    if (difficulty === 'Medium') {
      maxTime = 600;
    }
    if (difficulty === 'Hard') {
      maxTime = 480;
    }
    const newSession: Session = {
      id: uuidv4(),
      code: code,
      maxTime: maxTime,
      createdAt: new Date(),
      players: [agentId],
      started: false,
    };
    await this.redisService.set(`session:${code}`, JSON.stringify(newSession));
    return newSession;
  }

  async getAllSessions(): Promise<string[]> {
    return await this.redisService.getAll(`session`);
  }

  async getSession(sessionCode: string): Promise<any> {
    const sessionData = await this.redisService.get(`session:${sessionCode}`);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async updateSession(
    sessionCode: string,
    updatedData: Partial<Session>,
  ): Promise<Session | null> {
    const session = await this.getSession(sessionCode);
    if (session) {
      const newSession = { ...session, ...updatedData };
      await this.redisService.set(
        `session:${sessionCode}`,
        JSON.stringify(newSession),
      );
      return newSession;
    }
    return null;
  }

  async deleteSession(sessionCode: string): Promise<void> {
    await this.redisService.del(`session:${sessionCode}`);
  }

  async addPlayerToSession(sessionCode: string, player: string): Promise<any> {
    const session = await this.getSession(sessionCode);
    if (!session) {
      return null;
    }
    if (session.players.includes(player)) {
      return session;
    }
    session.players.push(player);
    await this.updateSession(sessionCode, session);
    return session;
  }

  async removePlayerFromSession(
    sessionCode: string,
    player: string,
  ): Promise<any> {
    const session = await this.getSession(sessionCode);
    if (!session) {
      return null;
    }
    session.players = session.players.filter((p) => p !== player);
    await this.updateSession(sessionCode, session);
    return session;
  }

  async updateTimer(sessionCode: string, remaining: number): Promise<any> {
    const session = await this.getSession(sessionCode);
    if (!session) {
      return null;
    }
    session.remaining = remaining;
    await this.updateSession(sessionCode, session);
    return session;
  }
}
