import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Campos que el usuario puede editar de su perfil: nombre, email, telefono.
// Se excluyen a propósito:
//  - tipo:     el rol no se cambia editando el perfil.
//  - password: el cambio de contraseña tendrá su propio endpoint (para encriptarla bien).
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['tipo', 'password'] as const),
) {}