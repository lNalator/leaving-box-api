import { ApiProperty } from '@nestjs/swagger';

export default class CreateSessionDTO {
  @ApiProperty({
    example: 'Easy',
    name: 'difficulty',
    type: String,
    required: true,
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @ApiProperty({
    example: '123456',
    name: 'agentId',
    type: String,
    required: true,
  })
  agentId: string;
}
