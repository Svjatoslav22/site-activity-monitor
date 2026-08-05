import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MonitorDocument = Monitor & Document;

@Schema({ timestamps: true })
export class Monitor {
  @Prop({ required: true, type: String, index: true })
  userId!: string;

  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  url!: string;

  @Prop({ default: 5, type: Number })
  interval!: number;

  @Prop({ default: true, type: Boolean })
  isActive!: boolean;

  @Prop({ default: 'unknown', type: String })
  lastStatus!: string;

  @Prop({ default: null, type: Date })
  lastCheckedAt!: Date;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
