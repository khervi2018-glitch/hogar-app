import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'passwordActual es obligatorio' })
  @MaxLength(100)
  passwordActual: string;

  @ApiProperty({ example: 'nuevaClave123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'la nueva contraseña debe tener al menos 6 caracteres' })
  @MaxLength(100)
  passwordNueva: string;
}