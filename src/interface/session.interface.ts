export interface Session {
  id: string;
  code: string;
  agentId: string;
  operatorIds: string[];
  createdAt: Date;
}
