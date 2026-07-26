// monitors/schemas/monitor.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MonitorDocument = Monitor & Document;

@Schema({ timestamps: true })
export class Monitor {
  @Prop({ required: true, type: String })
  name!: string; // "Мій сайт"

  @Prop({ required: true, type: String })
  url!: string; // "https://example.com"

  @Prop({ default: 5, type: Number })
  interval!: number; // перевіряти кожні N хвилин

  @Prop({ default: true, type: Boolean })
  isActive!: boolean;

  @Prop({ default: 'unknown', type: String })
  lastStatus!: string; // 'up' | 'down' | 'unknown'

  @Prop({ default: null, type: Date })
  lastCheckedAt!: Date;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
