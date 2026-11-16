import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './usuario.schema';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
  ) {}

  async obtenerPerfil(id: string): Promise<UsuarioDocument> {
    const usuario = await this.usuarios
      .findOne({ _id: id, activo: true })
      .select('-passwordHash')
      .exec();
    if (!usuario) throw new NotFoundException('La cuenta no está disponible.');
    return usuario;
  }
}
