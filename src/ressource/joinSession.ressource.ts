import { ApiProperty } from '@nestjs/swagger';

export default class JoinSessionDTO {
  @ApiProperty({
    example: 'INSERT CODE',
    name: 'sessionCode',
    type: String,
    required: true,
  })
  sessionCode: string;
}
