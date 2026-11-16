import { Type } from 'class-transformer';
import { IsIn, IsMongoId, IsOptional, Max, Min } from 'class-validator';

export class ListarPublicacionesDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit = 10;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset = 0;

  @IsOptional()
  @IsIn(['fecha', 'likes'])
  orden: 'fecha' | 'likes' = 'fecha';

  @IsOptional()
  @IsMongoId()
  authorId?: string;
}
