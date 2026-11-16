import { IsDateString, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  apellido!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,30}$/)
  username!: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
  password!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  biografia?: string;
}
