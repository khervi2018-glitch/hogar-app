import { IsEmail, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../entities/user.entity';

// Tipos que se pueden elegir al registrarse.
// "admin" queda fuera a propósito: un admin solo se crea por base de datos.
const TIPOS_REGISTRO = [UserType.CLIENTE, UserType.TECNICO];

export class CreateUserDto {
  @ApiProperty({ enum: TIPOS_REGISTRO, example: UserType.CLIENTE })
  @IsIn(TIPOS_REGISTRO, { message: 'tipo debe ser cliente o tecnico' })
  tipo: UserType;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @MinLength(6)
  password: string;
}