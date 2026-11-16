import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsuarioAutenticado } from '../common/usuario-autenticado';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
@UseGuards(JwtAuthGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get('perfil')
  perfil(@Req() request: { user: UsuarioAutenticado }) {
    return this.usuariosService.obtenerPerfil(request.user.sub);
  }
}
