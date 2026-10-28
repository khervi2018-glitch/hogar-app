import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column({ nullable: true })
  icono: string;

  @Column({ default: true })
  activo: boolean;
}