import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioAutenticado } from '../common/usuario-autenticado';
import { Usuario } from '../usuarios/usuario.schema';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { Publicacion } from './publicacion.schema';

const datosAutor = 'nombre apellido username fotoPerfilUrl';
const poblaciones = [
  { path: 'autorId', select: datosAutor },
  { path: 'comentarios.autorId', select: 'nombre username fotoPerfilUrl' },
];

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicaciones: Model<Publicacion>,
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
  ) {}

  async crear(
    dto: CrearPublicacionDto,
    usuario: UsuarioAutenticado,
    imagenUrl: string,
  ) {
    const publicacion = await this.publicaciones.create({
      ...dto,
      autorId: new Types.ObjectId(usuario.sub),
      imagenUrl,
      likes: [],
      comentarios: [],
      activo: true,
    });
    return this.publicaciones.findById(publicacion.id).populate(poblaciones).exec();
  }

  async listar(query: ListarPublicacionesDto) {
    const filtro: Record<string, unknown> = { activo: true };
    if (query.authorId) filtro.autorId = new Types.ObjectId(query.authorId);

    if (query.orden === 'likes') {
      const resultados = await this.publicaciones
        .aggregate([
          { $match: filtro },
          {
            $addFields: {
              likesCount: { $size: { $ifNull: ['$likes', []] } },
            },
          },
          { $sort: { likesCount: -1, createdAt: -1 } },
          { $skip: query.offset },
          { $limit: query.limit },
        ])
        .exec();
      return this.publicaciones.populate(resultados, poblaciones);
    }

    const resultados = await this.publicaciones
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(query.offset)
      .limit(query.limit)
      .populate(poblaciones)
      .lean()
      .exec();
    return resultados.map((publicacion) => ({
      ...publicacion,
      likesCount: publicacion.likes.length,
    }));
  }

  async darLike(id: string, usuario: UsuarioAutenticado) {
    const resultado = await this.publicaciones
      .updateOne(
        { _id: id, activo: true },
        { $addToSet: { likes: new Types.ObjectId(usuario.sub) } },
      )
      .exec();
    this.validarPublicacionEncontrada(resultado.matchedCount);
    return { liked: true };
  }

  async quitarLike(id: string, usuario: UsuarioAutenticado) {
    const resultado = await this.publicaciones
      .updateOne(
        { _id: id, activo: true },
        { $pull: { likes: new Types.ObjectId(usuario.sub) } },
      )
      .exec();
    this.validarPublicacionEncontrada(resultado.matchedCount);
    return { liked: false };
  }

  async eliminar(id: string, usuario: UsuarioAutenticado) {
    const publicacion = await this.publicaciones.findOne({ _id: id, activo: true }).exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe.');

    if (
      publicacion.autorId.toString() !== usuario.sub &&
      usuario.rol !== 'administrador'
    ) {
      throw new ForbiddenException('No tenés permiso para eliminar esta publicación.');
    }

    await this.publicaciones.updateOne({ _id: id }, { $set: { activo: false } }).exec();
    return { message: 'Publicación eliminada.' };
  }

  async comentar(
    id: string,
    dto: CrearComentarioDto,
    usuario: UsuarioAutenticado,
  ) {
    const [publicacion, autor] = await Promise.all([
      this.publicaciones
        .findOneAndUpdate(
          { _id: id, activo: true },
          {
            $push: {
              comentarios: {
                autorId: new Types.ObjectId(usuario.sub),
                texto: dto.texto.trim(),
              },
            },
          },
          { new: true },
        )
        .populate(poblaciones)
        .exec(),
      this.usuarios.exists({ _id: usuario.sub, activo: true }),
    ]);

    if (!autor) throw new NotFoundException('La cuenta no está disponible.');
    if (!publicacion) throw new NotFoundException('La publicación no existe.');
    return publicacion;
  }

  private validarPublicacionEncontrada(cantidad: number): void {
    if (cantidad === 0) throw new NotFoundException('La publicación no existe.');
  }
}
