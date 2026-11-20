import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TechnicianProfilesService } from './technician-profiles.service';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { UpdateTechnicianProfileDto } from './dto/update-technician-profile.dto';
import { SearchNearbyDto } from './dto/search-nearby.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserType } from '../users/entities/user.entity';

type AuthRequest = { user: { userId: string; email: string; tipo: string } };

@ApiTags('Technician Profiles')
@Controller('technician-profiles')
export class TechnicianProfilesController {
  constructor(
    private readonly technicianProfilesService: TechnicianProfilesService,
  ) {}

  /** Solo el dueño del perfil o un admin. */
  private async assertOwnerOrAdmin(profileId: string, user: AuthRequest['user']) {
    const profile: any = await this.technicianProfilesService.findOne(profileId);
    const ownerId = profile.user?.id ?? profile.userId;
    if (ownerId !== user.userId && user.tipo !== UserType.ADMIN) {
      throw new ForbiddenException('Solo puedes modificar tu propio perfil de técnico');
    }
  }

  @ApiOperation({ summary: 'Crear MI perfil de técnico (el usuario sale del token)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTechnicianProfileDto, @Req() req: AuthRequest) {
    // Se ignora el userId del body: el perfil SIEMPRE es del usuario logueado
    return this.technicianProfilesService.create({ ...dto, userId: req.user.userId });
  }

  @ApiOperation({ summary: 'Listar todos los perfiles de técnico' })
  @Get()
  findAll() {
    return this.technicianProfilesService.findAll();
  }

  @ApiOperation({
    summary: 'Buscar técnicos cercanos a una ubicación, opcionalmente filtrado por categoría',
  })
  @Get('search/nearby')
  findNearby(@Query() query: SearchNearbyDto) {
    return this.technicianProfilesService.findNearby(
      query.latitud,
      query.longitud,
      query.categoriaId,
    );
  }

  @ApiOperation({ summary: 'Obtener un perfil de técnico por id' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.technicianProfilesService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar MI perfil de técnico (dueño o admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianProfileDto,
    @Req() req: AuthRequest,
  ) {
    await this.assertOwnerOrAdmin(id, req.user);
    return this.technicianProfilesService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar MI perfil de técnico (dueño o admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    await this.assertOwnerOrAdmin(id, req.user);
    return this.technicianProfilesService.remove(id);
  }
}