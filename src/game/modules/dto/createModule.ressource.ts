import { ApiProperty } from '@nestjs/swagger';

export class RulesDto {
  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  description: string;
}

export class LevelDto {
  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  description: string;

  @ApiProperty({ type: [RulesDto], required: true })
  rules: RulesDto[];
}

export class CreateModuleDto {
  @ApiProperty({ type: String, required: true })
  name: string;

  @ApiProperty({ type: String, required: true })
  description: string;

  @ApiProperty({ type: [RulesDto], required: true })
  rules: RulesDto[];

  @ApiProperty({ type: Boolean, required: true })
  hasLevels: boolean;

  @ApiProperty({ type: [LevelDto], required: false })
  levels?: LevelDto[];

  @ApiProperty({ type: String, required: true })
  defuseMethod: string;
}
