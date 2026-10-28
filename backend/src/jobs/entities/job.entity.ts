import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TechnicianProfile } from '../../technician-profiles/entities/technician-profile.entity';
import { ServiceCategory } from '../../service-categories/entities/service-category.entity';

export enum JobStatus {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  EN_PROGRESO = 'en_progreso',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}
export enum PaymentStatus {
  PENDIENTE = 'pendiente',
  PAGADO = 'pagado',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => TechnicianProfile)
  @JoinColumn({ name: 'technician_profile_id' })
  tecnico: TechnicianProfile;

  @Column({ name: 'technician_profile_id' })
  technicianProfileId: string;

  @ManyToOne(() => ServiceCategory)
  @JoinColumn({ name: 'service_category_id' })
  categoria: ServiceCategory;

  @Column({ name: 'service_category_id' })
  serviceCategoryId: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.PENDIENTE,
  })
  estado: JobStatus;

  @Column('text')
  descripcion: string;

  @Column({ name: 'direccion_trabajo' })
  direccionTrabajo: string;

  @Column({
    name: 'precio_acordado',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precioAcordado: number;

  @Column({
  name: 'estado_pago',
  type: 'enum',
  enum: PaymentStatus,
  default: PaymentStatus.PENDIENTE,
  })
  estadoPago: PaymentStatus;

  @Column({ name: 'metodo_pago', type: 'varchar', nullable: true })
  metodoPago: string; // 'efectivo', 'transferencia', 'yape', 'plin', etc.

  @Column({ name: 'fecha_inicio', type: 'timestamp', nullable: true })
  fechaInicio: Date;

  @Column({ name: 'fecha_fin', type: 'timestamp', nullable: true })
  fechaFin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}