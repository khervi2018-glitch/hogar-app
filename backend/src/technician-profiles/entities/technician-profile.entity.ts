import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceCategory } from '../../service-categories/entities/service-category.entity';

export enum AntecedentesStatus {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity('technician_profiles')
export class TechnicianProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  dni: string;

  @Column()
  direccion: string;

  @Column({
    type: 'enum',
    enum: AntecedentesStatus,
    default: AntecedentesStatus.PENDIENTE,
    name: 'antecedentes_status',
  })
  antecedentesStatus: AntecedentesStatus;

  @Column({ name: 'radio_cobertura_km', type: 'float', default: 5 })
  radioCoberturaKm: number;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  ubicacion: string; // se maneja como punto geoespacial (lng, lat)

  @Column({ name: 'calificacion_promedio', type: 'float', default: 0 })
  calificacionPromedio: number;

  @ManyToMany(() => ServiceCategory)
  @JoinTable({
    name: 'technician_categories',
    joinColumn: { name: 'technician_profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_category_id', referencedColumnName: 'id' },
  })
  categorias: ServiceCategory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
