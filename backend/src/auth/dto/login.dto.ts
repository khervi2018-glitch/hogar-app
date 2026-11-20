import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'juan.perez@example.com' })
  @IsEmail({}, { message: 'email no es válido' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString({ message: 'password debe ser texto' })
  @IsNotEmpty({ message: 'password es obligatorio' })
  @MaxLength(100)
  password: string;
}