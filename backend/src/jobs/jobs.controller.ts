import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,   // ← agregar
  Req,             // ← agregar
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RegisterPaymentDto } from './dto/register-payment.dto';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: 'Crear una solicitud de trabajo (requiere autenticación)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @ApiOperation({ summary: 'Listar todos los trabajos' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener un trabajo por id' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar datos generales del trabajo' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @ApiOperation({
    summary: 'Cambiar el estado del trabajo (respeta las transiciones válidas)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateStatus(id, updateJobStatusDto);
  }

  @ApiOperation({ summary: 'Eliminar un trabajo' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  //@UseGuards(JwtAuthGuard)
  @Patch(':id/payment')
  registerPayment(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req,
  @Body() dto: RegisterPaymentDto,
) {
  const userId = req.user.sub ?? req.user.id ?? req.user.userId;
  return this.jobsService.registerPayment(id, userId, dto.metodoPago);
}
}