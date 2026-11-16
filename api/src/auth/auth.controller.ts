import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions, uploadedImageUrl } from '../common/upload.config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('fotoPerfil', imageUploadOptions))
  registro(
    @Body() dto: RegistroDto,
    @UploadedFile() fotoPerfil?: Express.Multer.File,
  ) {
    return this.authService.registro(dto, uploadedImageUrl(fotoPerfil));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
