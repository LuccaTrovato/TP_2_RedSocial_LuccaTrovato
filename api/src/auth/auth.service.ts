import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from '../usuarios/usuario.schema';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuarios: Model<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async registro(dto: RegistroDto, fotoPerfilUrl: string) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();
    const existente = await this.usuarios.exists({
      $or: [{ email }, { username }],
    });

    if (existente) {
      throw new ConflictException('El correo o nombre de usuario ya está registrado.');
    }

    const usuario = await this.usuarios.create({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      email,
      username,
      passwordHash: await bcrypt.hash(dto.password, 10),
      fechaNacimiento: new Date(dto.fechaNacimiento),
      biografia: dto.biografia?.trim() ?? '',
      fotoPerfilUrl,
      rol: 'usuario',
      activo: true,
    });

    return this.crearSesion(usuario);
  }

  async login(dto: LoginDto) {
    const identificador = dto.identificador.trim().toLowerCase();
    const usuario = await this.usuarios
      .findOne({
        activo: true,
        $or: [{ email: identificador }, { username: identificador }],
      })
      .select('+passwordHash')
      .exec();

    if (!usuario || !(await bcrypt.compare(dto.password, usuario.passwordHash))) {
      throw new UnauthorizedException('El usuario o la contraseña son incorrectos.');
    }

    return this.crearSesion(usuario);
  }

  private crearSesion(usuario: UsuarioDocument) {
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol,
    };

    return {
      usuario: {
        _id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        username: usuario.username,
        fechaNacimiento: usuario.fechaNacimiento,
        biografia: usuario.biografia,
        fotoPerfilUrl: usuario.fotoPerfilUrl,
        rol: usuario.rol,
      },
      access_token: this.jwt.sign(payload),
    };
  }
}
