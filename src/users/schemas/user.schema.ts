import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ default: 'Користувач' })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: '' })
  telegramUsername: string;

  @Prop({ default: '', select: false })
  password?: string;

  @Prop({ default: true })
  notifyOnDown: boolean;

  @Prop({ default: true })
  notifyOnRecovery: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
