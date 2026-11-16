import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions, uploadedImageUrl } from '../common/upload.config';
import { UsuarioAutenticado } from '../common/usuario-autenticado';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get()
  listar(@Query() query: ListarPublicacionesDto) {
    return this.publicacionesService.listar(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imagen', imageUploadOptions))
  crear(
    @Body() dto: CrearPublicacionDto,
    @Req() request: { user: UsuarioAutenticado },
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(
      dto,
      request.user,
      uploadedImageUrl(imagen),
    );
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  darLike(@Param('id') id: string, @Req() request: { user: UsuarioAutenticado }) {
    return this.publicacionesService.darLike(id, request.user);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  quitarLike(@Param('id') id: string, @Req() request: { user: UsuarioAutenticado }) {
    return this.publicacionesService.quitarLike(id, request.user);
  }

  @Post(':id/comentarios')
  @UseGuards(JwtAuthGuard)
  comentar(
    @Param('id') id: string,
    @Body() dto: CrearComentarioDto,
    @Req() request: { user: UsuarioAutenticado },
  ) {
    return this.publicacionesService.comentar(id, dto, request.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminar(@Param('id') id: string, @Req() request: { user: UsuarioAutenticado }) {
    return this.publicacionesService.eliminar(id, request.user);
  }
}
