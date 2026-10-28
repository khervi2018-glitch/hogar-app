import {
  IsArray,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTechnicianProfileDto {
  @ApiProperty({
    example: '075f3620-915d-4f24-94bc-88e60fbc79dd',
    description: 'ID del usuario (debe existir y ser de tipo tecnico)',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '72345678' })
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ example: 'Av. Los Álamos 123, San Isidro, Lima' })
  @IsNotEmpty()
  direccion: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Radio de cobertura en kilómetros',
  })
  @IsOptional()
  @IsNumber()
  radioCoberturaKm?: number;

  @ApiProperty({ example: -12.0972 })
  @IsLatitude()
  latitud: number;

  @ApiProperty({ example: -77.0367 })
  @IsLongitude()
  longitud: number;

  @ApiProperty({
    example: ['1b2b25d8-671b-46e2-b692-9dc7cf3be177'],
    description: 'IDs de las categorías de servicio del técnico',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  categoriaIds: string[];
}
