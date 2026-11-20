import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // QueryBuilder + addSelect: trae el passwordHash aunque la columna
    // este marcada como oculta (select: false) en la entidad.
    // El email se compara sin importar mayusculas/minusculas.
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('LOWER(u.email) = LOWER(:email)', { email: dto.email.trim() })
      .getOne();

    // Mismo mensaje en todos los casos: no revelamos si el email existe
    if (!user || !user.passwordHash || !dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, tipo: user.tipo };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        tipo: user.tipo,
      },
    };
  }
    async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId })
      .getOne();

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Usuario no válido');
    }

    const actualValida = await bcrypt.compare(dto.passwordActual, user.passwordHash);
    if (!actualValida) {
      // 400 (no 401): es un dato incorrecto, no una sesion invalida.
      // Un 401 haria que la app cierre la sesion.
      throw new BadRequestException('La contraseña actual no es correcta');
    }

    if (dto.passwordActual === dto.passwordNueva) {
      throw new BadRequestException('La nueva contraseña debe ser distinta a la actual');
    }

    const nuevoHash = await bcrypt.hash(dto.passwordNueva, 10);
    await this.usersRepo.update(user.id, { passwordHash: nuevoHash });
    return { message: 'Contraseña actualizada' };
  }
}