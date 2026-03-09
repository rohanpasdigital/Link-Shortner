import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LinkDocument = Link & Document;

//Link schema
@Schema({ timestamps: true })
export class Link {

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true })
  originalUrl!: string;

  @Prop({ required: true })
  originalLinkId!: string

  @Prop({ required: true })
  shortUrl!: string;

  @Prop({ default: 0 })
  totalClicks!: number;

  @Prop()
  moduleName!: string;

  @Prop()
  createdAt!: Date
}

export const LinkSchema = SchemaFactory.createForClass(Link);

