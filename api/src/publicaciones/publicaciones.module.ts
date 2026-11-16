import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Usuario, UsuarioSchema } from '../usuarios/usuario.schema';
import { AuthModule } from '../auth/auth.module';
import { Publicacion, PublicacionSchema } from './publicacion.schema';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService],
})
export class PublicacionesModule {}
