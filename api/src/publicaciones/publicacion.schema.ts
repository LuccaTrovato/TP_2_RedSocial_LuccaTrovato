import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ _id: true, timestamps: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 500 })
  texto!: string;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ type: Types.ObjectId, ref: 'Usuario', required: true })
  autorId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 120 })
  titulo!: string;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  descripcion!: string;

  @Prop({ default: '' })
  imagenUrl!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Usuario' }], default: [] })
  likes!: Types.ObjectId[];

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios!: Comentario[];

  @Prop({ default: true })
  activo!: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
