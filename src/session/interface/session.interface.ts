export interface Session {
  id: string;
  code: string;
  maxTime: number;
  createdAt: Date;
  players: string[];
  started: boolean;
}
