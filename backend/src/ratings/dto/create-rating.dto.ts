import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  puntaje: number;

  @IsOptional()
  @IsString()
  comentario?: string;
}