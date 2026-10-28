import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    example: '075f3620-915d-4f24-94bc-88e60fbc79dd',
    description: 'ID del usuario cliente que solicita el trabajo',
  })
  @IsUUID()
  clienteId: string;

  @ApiProperty({
    example: 'a40b53de-2540-409b-b709-6cc6182b21a9',
    description: 'ID del perfil de técnico (no del user)',
  })
  @IsUUID()
  technicianProfileId: string;

  @ApiProperty({ example: '1b2b25d8-671b-46e2-b692-9dc7cf3be177' })
  @IsUUID()
  serviceCategoryId: string;

  @ApiProperty({ example: 'Se dañó el interruptor de la sala, no enciende la luz' })
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 'Av. Los Álamos 123, San Isidro, Lima' })
  @IsNotEmpty()
  direccionTrabajo: string;

  @ApiPropertyOptional({ example: 80.5, description: 'Precio acordado (opcional al crear)' })
  @IsOptional()
  precioAcordado?: number;
}