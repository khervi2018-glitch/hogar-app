import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserType } from './entities/user.entity';

// Forma de request.user según lo que retorna JwtStrategy.validate()
interface AuthUser {
  userId: string;
  email: string;
  tipo: string;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---------- Reglas de acceso ----------

  private isAdmin(user: AuthUser): boolean {
    return user.tipo === UserType.ADMIN;
  }

  /** Permite la acción solo si es el propio usuario o un admin. */
  private assertSelfOrAdmin(user: AuthUser, targetId: string): void {
    if (user.userId !== targetId && !this.isAdmin(user)) {
      throw new ForbiddenException('No tienes permiso sobre este usuario');
    }
  }

  // ---------- Endpoints ----------

  @ApiOperation({ summary: 'Registrar un nuevo usuario (cliente o técnico)' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Listar todos los usuarios (solo admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: { user: AuthUser }) {
    if (!this.isAdmin(req.user)) {
      throw new ForbiddenException('Solo un administrador puede listar usuarios');
    }
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Ver un usuario (uno mismo o admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: AuthUser },
  ) {
    this.assertSelfOrAdmin(req.user, id);
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Editar un usuario (uno mismo o admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: { user: AuthUser },
  ) {
    this.assertSelfOrAdmin(req.user, id);
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Eliminar un usuario (uno mismo o admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: AuthUser },
  ) {
    this.assertSelfOrAdmin(req.user, id);
    return this.usersService.remove(id);
  }
}