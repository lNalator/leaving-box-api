export interface Session {
  id: string;
  code: string;
  agentId: string;
  maxTime: number;
  operatorIds: string[];
  createdAt: Date;
}
