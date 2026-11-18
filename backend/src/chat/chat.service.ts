import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Job, JobStatus } from '../jobs/entities/job.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messagesRepo: Repository<ChatMessage>,
    @InjectRepository(Job)
    private readonly jobsRepo: Repository<Job>,
  ) {}

  async saveMessage(data: { jobId: string; senderId: string; contenido: string }) {
    const message = this.messagesRepo.create({
      jobId: data.jobId,
      senderId: data.senderId,
      contenido: data.contenido,
    });
    return this.messagesRepo.save(message);
  }

  /** Lanza error si el usuario no es el cliente ni el tecnico del trabajo. */
  async assertParticipant(jobId: string, userId: string): Promise<Job> {
    const job = await this.jobsRepo.findOne({
      where: { id: jobId },
      relations: { tecnico: { user: true } },
    });
    if (!job) {
      throw new NotFoundException('El trabajo no existe');
    }
    const participa = job.clienteId === userId || job.tecnico?.user?.id === userId;
    if (!participa) {
      throw new ForbiddenException('No participas en este trabajo');
    }
    return job;
  }

  async getHistory(jobId: string, userId: string) {
    await this.assertParticipant(jobId, userId);
    return this.messagesRepo.find({
      where: { jobId },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Conversaciones del usuario segun el rol con el que mira la app.
   * Incluye trabajos con mensajes, o activos (aceptado / en progreso).
   * Ordenadas por la actividad mas reciente.
   */
  async getConversations(userId: string, rol: 'cliente' | 'tecnico') {
    const where: FindOptionsWhere<Job> =
      rol === 'tecnico'
        ? { tecnico: { user: { id: userId } } }
        : { clienteId: userId };

    const jobs = await this.jobsRepo.find({
      where,
      relations: { cliente: true, tecnico: { user: true }, categoria: true },
    });
    if (jobs.length === 0) return [];

    // Mensajes de esos trabajos, del mas nuevo al mas viejo
    const mensajes = await this.messagesRepo.find({
      where: { jobId: In(jobs.map((j) => j.id)) },
      order: { createdAt: 'DESC' },
    });

    // Nos quedamos con el ultimo mensaje de cada trabajo
    const ultimoPorJob = new Map<string, ChatMessage>();
    for (const m of mensajes) {
      if (!ultimoPorJob.has(m.jobId)) ultimoPorJob.set(m.jobId, m);
    }

    const activos: JobStatus[] = [JobStatus.ACEPTADO, JobStatus.EN_PROGRESO];

    return jobs
      .filter((j) => ultimoPorJob.has(j.id) || activos.includes(j.estado))
      .map((j) => {
        const ultimo = ultimoPorJob.get(j.id);
        const otro = rol === 'tecnico' ? j.cliente : j.tecnico?.user;
        return {
          jobId: j.id,
          estado: j.estado,
          categoria: j.categoria?.nombre ?? null,
          otroUsuario: otro ? { id: otro.id, nombre: otro.nombre } : null,
          ultimoMensaje: ultimo
            ? {
                contenido: ultimo.contenido,
                createdAt: ultimo.createdAt,
                esMio: ultimo.senderId === userId,
              }
            : null,
          actividad: ultimo?.createdAt ?? j.createdAt,
        };
      })
      .sort((a, b) => new Date(b.actividad).getTime() - new Date(a.actividad).getTime());
  }
  
}