import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceCategoryDto {
  @ApiProperty({ example: 'Electricidad' })
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: '⚡' })
  @IsOptional()
  icono?: string;
}