import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Job, JobStatus, PaymentStatus } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technician-profiles/entities/technician-profile.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';

// Define qué transiciones de estado son válidas desde cada estado actual
const TRANSICIONES_VALIDAS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.PENDIENTE]: [JobStatus.ACEPTADO, JobStatus.CANCELADO],
  [JobStatus.ACEPTADO]: [JobStatus.EN_PROGRESO, JobStatus.CANCELADO],
  [JobStatus.EN_PROGRESO]: [JobStatus.FINALIZADO, JobStatus.CANCELADO],
  [JobStatus.FINALIZADO]: [],
  [JobStatus.CANCELADO]: [],
};

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly repo: Repository<Job>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(TechnicianProfile)
    private readonly techProfilesRepo: Repository<TechnicianProfile>,
    @InjectRepository(ServiceCategory)
    private readonly categoriesRepo: Repository<ServiceCategory>,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const cliente = await this.usersRepo.findOne({ where: { id: dto.clienteId } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const tecnico = await this.techProfilesRepo.findOne({
      where: { id: dto.technicianProfileId },
    });
    if (!tecnico) {
      throw new NotFoundException('Perfil de técnico no encontrado');
    }

    const categoria = await this.categoriesRepo.findOne({
      where: { id: dto.serviceCategoryId },
    });
    if (!categoria) {
      throw new NotFoundException('Categoría de servicio no encontrada');
    }

    const job = this.repo.create({
      clienteId: dto.clienteId,
      technicianProfileId: dto.technicianProfileId,
      serviceCategoryId: dto.serviceCategoryId,
      descripcion: dto.descripcion,
      direccionTrabajo: dto.direccionTrabajo,
      precioAcordado: dto.precioAcordado,
    });

    return this.repo.save(job);
  }

  findAll() {
    return this.repo.find({
      //relations: { cliente: true, tecnico: true, categoria: true },
      relations: { cliente: true, tecnico: { user: true }, categoria: true },
      order: { createdAt: 'DESC' },
    });
  }

    /**
   * Trabajos del usuario segun el rol con el que mira la app:
   *  - cliente: los que el pidio
   *  - tecnico: los que le pidieron a su perfil de tecnico
   */
  findMine(userId: string, rol: 'cliente' | 'tecnico') {
    const where: FindOptionsWhere<Job> =
      rol === 'tecnico'
        ? { tecnico: { user: { id: userId } } }
        : { clienteId: userId };

    return this.repo.find({
      where,
      relations: { cliente: true, tecnico: { user: true }, categoria: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const job = await this.repo.findOne({
      where: { id },
      //relations: { cliente: true, tecnico: true, categoria: true },
      relations: { cliente: true, tecnico: { user: true }, categoria: true },
    });
    if (!job) {
      throw new NotFoundException(`Trabajo con id ${id} no encontrado`);
    }
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    const job = await this.findOne(id);
    Object.assign(job, dto);
    return this.repo.save(job);
  }

  async updateStatus(id: string, dto: UpdateJobStatusDto) {
    const job = await this.findOne(id);

    const estadosPermitidos = TRANSICIONES_VALIDAS[job.estado];
    if (!estadosPermitidos.includes(dto.estado)) {
      throw new BadRequestException(
        `No se puede pasar de "${job.estado}" a "${dto.estado}". ` +
        `Transiciones válidas desde "${job.estado}": ${estadosPermitidos.join(', ') || 'ninguna (estado final)'}`,
      );
    }

    job.estado = dto.estado;

    if (dto.estado === JobStatus.EN_PROGRESO) {
      job.fechaInicio = new Date();
    }
    if (dto.estado === JobStatus.FINALIZADO) {
      job.fechaFin = new Date();
    }

    return this.repo.save(job);
  }

  async remove(id: string) {
    const job = await this.findOne(id);
    await this.repo.remove(job);
  }

  async registerPayment(jobId: string, userId: string, metodoPago: string) {
    const job = await this.repo.findOne({
      where: { id: jobId },
      relations: {
        cliente: true,
        tecnico: { user: true },
      },
    });

    if (!job) {
      throw new NotFoundException('El trabajo no existe');
    }

    // Solo se registra pago de un trabajo finalizado
    if (job.estado !== JobStatus.FINALIZADO) {
      throw new BadRequestException(
        `Solo se puede registrar el pago de un trabajo finalizado (estado actual: ${job.estado})`,
      );
    }

    // Solo los participantes pueden registrar el pago
    const esParticipante =
      userId === job.clienteId || userId === job.tecnico.user.id;
    if (!esParticipante) {
      throw new ForbiddenException(
        'Solo los participantes del trabajo pueden registrar el pago',
      );
    }

    // No duplicar el registro
    if (job.estadoPago === PaymentStatus.PAGADO) {
      throw new ConflictException('El pago de este trabajo ya fue registrado');
    }

    job.estadoPago = PaymentStatus.PAGADO;
    job.metodoPago = metodoPago;
    return this.repo.save(job);
  }
}