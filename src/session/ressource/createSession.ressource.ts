import { ApiProperty } from '@nestjs/swagger';

export default class CreateSessionDTO {
  @ApiProperty({
    example: 'Easy',
    name: 'difficulty',
    type: String,
    required: true,
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
