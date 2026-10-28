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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TechnicianProfilesService } from './technician-profiles.service';
import { CreateTechnicianProfileDto } from './dto/create-technician-profile.dto';
import { UpdateTechnicianProfileDto } from './dto/update-technician-profile.dto';
import { SearchNearbyDto } from './dto/search-nearby.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Technician Profiles')
@Controller('technician-profiles')
export class TechnicianProfilesController {
  constructor(
    private readonly technicianProfilesService: TechnicianProfilesService,
  ) {}

  @ApiOperation({
    summary: 'Crear el perfil de técnico de un usuario (requiere autenticación)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTechnicianProfileDto: CreateTechnicianProfileDto) {
    return this.technicianProfilesService.create(createTechnicianProfileDto);
  }

  @ApiOperation({ summary: 'Listar todos los perfiles de técnico' })
  @Get()
  findAll() {
    return this.technicianProfilesService.findAll();
  }

  @ApiOperation({
    summary:
      'Buscar técnicos cercanos a una ubicación, opcionalmente filtrado por categoría',
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
  findOne(@Param('id') id: string) {
    return this.technicianProfilesService.findOne(id);
  }

  @ApiOperation({
    summary: 'Actualizar un perfil de técnico (requiere autenticación)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTechnicianProfileDto: UpdateTechnicianProfileDto,
  ) {
    return this.technicianProfilesService.update(id, updateTechnicianProfileDto);
  }

  @ApiOperation({
    summary: 'Eliminar un perfil de técnico (requiere autenticación)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technicianProfilesService.remove(id);
  }
}