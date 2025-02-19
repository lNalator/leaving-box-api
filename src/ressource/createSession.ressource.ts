import { ApiProperty } from '@nestjs/swagger';

export default class CreateSessionDTO {
  @ApiProperty({ example: '1', name: 'agentId', type: String, required: true })
  agentId: string;
}
