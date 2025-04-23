import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class Rules {
  name: string;
  description: string;
}

export class Level {
  name: string;
  description: string;
  rules: Rules;
}

@Schema()
export class ModuleEntity {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: false })
  pdfUrl?: string;

  @Prop({ type: Boolean, required: true })
  hasLevels: boolean;

  @Prop({ type: [Level], required: false })
  levels?: Level[];

  @Prop({ type: String, required: true })
  defuseMethod: string;
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleEntity);
