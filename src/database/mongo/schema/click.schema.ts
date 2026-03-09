import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClickDocument = Click & Document;

// Clicl schema
@Schema({ timestamps: true })
export class Click {
  @Prop({ type: Types.ObjectId, ref: 'Link', required: true, index: true })
  linkId!: Types.ObjectId;

  @Prop()
  ipAddress?: string;

  @Prop()
  country?: string;

  @Prop()
  browser?: string;

  @Prop()
  device?: string;

  @Prop()
  referrer?: string;
}

export const ClickSchema = SchemaFactory.createForClass(Click);


ClickSchema.index({ country: 1 });
ClickSchema.index({ createdAt: -1 });