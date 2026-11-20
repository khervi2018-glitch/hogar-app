import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type AuthRequest = { user: { userId: string; email: string; tipo: string } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Maximo 5 intentos por minuto por IP: frena ataques de fuerza bruta
  @ApiOperation({ summary: 'Iniciar sesión y obtener un token JWT' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Cambiar la contraseña del usuario logueado' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Patch('password')
  changePassword(@Body() dto: ChangePasswordDto, @Req() req: AuthRequest) {
    return this.authService.changePassword(req.user.userId, dto);
  }
}