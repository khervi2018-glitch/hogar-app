import { IsLatitude, IsLongitude, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchNearbyDto {
  @ApiProperty({ example: -12.0972 })
  @Type(() => Number)
  @IsLatitude()
  latitud: number;

  @ApiProperty({ example: -77.0367 })
  @Type(() => Number)
  @IsLongitude()
  longitud: number;

  @ApiPropertyOptional({ example: '1b2b25d8-671b-46e2-b692-9dc7cf3be177' })
  @IsOptional()
  @IsUUID()
  categoriaId?: string;
}