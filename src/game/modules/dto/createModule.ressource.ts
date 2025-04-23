import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  description: string;

  @ApiProperty({ type: [String], required: false })
  rules?: string[];

  @ApiProperty({ type: String, required: false })
  imgUrl?: string;
}
