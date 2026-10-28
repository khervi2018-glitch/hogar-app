import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { Job, JobStatus } from '../jobs/entities/job.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { TechnicianProfile } from '../technician-profiles/entities/technician-profile.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(TechnicianProfile)
    private readonly techProfileRepo: Repository<TechnicianProfile>,
  ) {}

  async create(jobId: string, authorId: string, dto: CreateRatingDto) {
    // 1. Buscar el job con sus participantes
    //    (tecnico es un TechnicianProfile, por eso cargamos tambien tecnico.user)
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: {
  cliente: true,
  tecnico: {
    user: true,
        },
    },
    });

    if (!job) {
      throw new NotFoundException('El trabajo no existe');
    }

    // 2. Solo se puede calificar un trabajo finalizado
    if (job.estado !== JobStatus.FINALIZADO) {
      throw new BadRequestException(
        `Solo se puede calificar un trabajo finalizado (estado actual: ${job.estado})`,
      );
    }

    // 3. Identificar el rol del autor y deducir a quién califica
    const tecnicoUserId = job.tecnico.user.id;
    let targetId: string;

    if (authorId === job.clienteId) {
      targetId = tecnicoUserId; // el cliente califica al tecnico
    } else if (authorId === tecnicoUserId) {
      targetId = job.clienteId; // el tecnico califica al cliente
    } else {
      throw new ForbiddenException(
        'Solo los participantes del trabajo pueden calificarlo',
      );
    }

    // 4. Verificar que no haya calificado antes este job
    const existente = await this.ratingRepo.findOne({
      where: { job: { id: jobId }, author: { id: authorId } },
    });
    if (existente) {
      throw new ConflictException('Ya calificaste este trabajo');
    }

    // 5. Crear y guardar
    const rating = this.ratingRepo.create({
      job: { id: jobId } as Job,
      author: { id: authorId } as any,
      target: { id: targetId } as any,
      puntaje: dto.puntaje,
      comentario: dto.comentario, //comentario: dto.comentario ?? null,
    });

    //return this.ratingRepo.save(rating);
      const saved = await this.ratingRepo.save(rating);

    // Si la calificacion fue PARA el tecnico, recalcular su promedio
    if (targetId === tecnicoUserId) {
      await this.actualizarPromedioTecnico(job.tecnico.id, targetId);
    }

    return saved;
  }

  private async actualizarPromedioTecnico(
    technicianProfileId: string,
    tecnicoUserId: string,
  ) {
    const resultado = await this.ratingRepo
      .createQueryBuilder('rating')
      .select('AVG(rating.puntaje)', 'promedio')
      .where('rating.target_id = :tecnicoUserId', { tecnicoUserId })
      .getRawOne();

    const promedio = resultado?.promedio
      ? Math.round(Number(resultado.promedio) * 10) / 10 // 1 decimal: 4.3
      : 0;

    await this.techProfileRepo.update(technicianProfileId, {
      calificacionPromedio: promedio,
    });
  }
  

  async findByJob(jobId: string) {
    return this.ratingRepo.find({
      where: { job: { id: jobId } },
      relations: {
        author: true,
        target: true,
        },
      order: { createdAt: 'DESC' },
    });
  }
}