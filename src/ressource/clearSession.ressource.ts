import { ApiProperty } from '@nestjs/swagger';

export default class ClearSessionDTO {
  @ApiProperty({
    example: '8aec252d-1111-4ad4-1111-d64ed058f2ef',
    name: 'sessionId',
    type: String,
    required: true,
  })
  sessionId: string;
}
