import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ required: true, trim: true })
  apellido!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  username!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, type: Date })
  fechaNacimiento!: Date;

  @Prop({ default: '' })
  biografia!: string;

  @Prop({ default: '' })
  fotoPerfilUrl!: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  rol!: 'usuario' | 'administrador';

  @Prop({ default: true })
  activo!: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
