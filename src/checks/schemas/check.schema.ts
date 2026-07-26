import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CheckDocument = Check & Document;

@Schema({ timestamps: true })
export class Check {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Monitor', required: true })
  monitorId!: string;

  @Prop({ required: true, type: String })
  status!: string;

  @Prop({ type: Number })
  responseTime!: number;

  @Prop({ type: Number })
  statusCode!: number | null; // Тепер ми явно сказали, що це число (або null)

  @Prop({ default: null, type: String })
  error!: string | null;
}

export const CheckSchema = SchemaFactory.createForClass(Check);
