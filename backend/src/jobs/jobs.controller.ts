import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Req,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { RegisterPaymentDto } from './dto/register-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Job } from './entities/job.entity';
import { UserType } from '../users/entities/user.entity';

// Forma de request.user segun JwtStrategy.validate()
interface AuthUser {
  userId: string;
  email: string;
  tipo: string;
}
type AuthRequest = { user: AuthUser };

const ROLES_VISTA = ['cliente', 'tecnico'];

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // ---------- Reglas de acceso ----------

  private isAdmin(user: AuthUser): boolean {
    return user.tipo === UserType.ADMIN;
  }

  /** Solo el cliente del trabajo, su tecnico o un admin. */
  private assertParticipantOrAdmin(job: Job, user: AuthUser): void {
    const esCliente = job.clienteId === user.userId;
    const esTecnico = job.tecnico?.user?.id === user.userId;
    if (!esCliente && !esTecnico && !this.isAdmin(user)) {
      throw new ForbiddenException('No participas en este trabajo');
    }
  }

  // ---------- Endpoints ----------

  @ApiOperation({ summary: 'Crear una solicitud de trabajo (el cliente es el usuario del token)' })
  @Post()
  create(@Body() createJobDto: CreateJobDto, @Req() req: AuthRequest) {
    // Se ignora el clienteId del body: el cliente SIEMPRE es quien hace la peticion
    return this.jobsService.create({ ...createJobDto, clienteId: req.user.userId });
  }

  // IMPORTANTE: 'mine' va ANTES de ':id', si no Nest tomaria "mine" como un id
  @ApiOperation({ summary: 'Mis trabajos, como cliente o como tecnico' })
  @ApiQuery({ name: 'rol', enum: ROLES_VISTA })
  @Get('mine')
  findMine(@Query('rol') rol: string, @Req() req: AuthRequest) {
    if (!ROLES_VISTA.includes(rol)) {
      throw new BadRequestException('rol debe ser cliente o tecnico');
    }
    return this.jobsService.findMine(req.user.userId, rol as 'cliente' | 'tecnico');
  }

  @ApiOperation({ summary: 'Listar todos los trabajos (solo admin)' })
  @Get()
  findAll(@Req() req: AuthRequest) {
    if (!this.isAdmin(req.user)) {
      throw new ForbiddenException('Solo un administrador puede listar todos los trabajos');
    }
    return this.jobsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un trabajo por id (solo participantes o admin)' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthRequest) {
    const job = await this.jobsService.findOne(id);
    this.assertParticipantOrAdmin(job, req.user);
    return job;
  }

  @ApiOperation({ summary: 'Actualizar datos generales del trabajo' })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @ApiOperation({ summary: 'Cambiar el estado del trabajo (respeta las transiciones válidas)' })
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @ApiOperation({ summary: 'Eliminar un trabajo' })
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.jobsService.remove(id);
  }

  @ApiOperation({ summary: 'Registrar el pago de un trabajo finalizado' })
  @Patch(':id/payment')
  registerPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
    @Body() dto: RegisterPaymentDto,
  ) {
    return this.jobsService.registerPayment(id, req.user.userId, dto.metodoPago);
  }
}