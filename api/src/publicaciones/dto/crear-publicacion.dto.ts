import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  titulo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  descripcion!: string;
}
