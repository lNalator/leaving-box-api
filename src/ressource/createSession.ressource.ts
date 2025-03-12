import { ApiProperty } from '@nestjs/swagger';

export default class CreateSessionDTO {
  @ApiProperty({ example: '1', name: 'agentId', type: String, required: true })
  agentId: string;

  @ApiProperty({
    example: 'Easy',
    name: 'difficulty',
    type: String,
    required: true,
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
