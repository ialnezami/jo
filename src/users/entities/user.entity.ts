import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  ref: string;
  @Prop({ required: false })
  email: string;
  @Prop({ required: false })
  jo: string;
  @Prop({ required: false })
  bearthday: string;
  @Prop({ required: false })
  prefecture: string;
  @Prop({
    type: mongoose.SchemaTypes.Date,
    default: new Date(Date.now() + 60 * 60 * 24 * 30 * 12 * 1000),
    expires: 0,
  })
  expiresAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;
