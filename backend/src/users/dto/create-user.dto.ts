import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../entities/user.entity';


export class CreateUserDto {
  @ApiProperty({ enum: UserType, example: UserType.CLIENTE })
  @IsEnum(UserType)
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