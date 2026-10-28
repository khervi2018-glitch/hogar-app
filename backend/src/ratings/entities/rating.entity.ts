import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ratings')
@Unique(['job', 'author']) // un usuario solo puede calificar un job UNA vez
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: User; // quién califica

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'target_id' })
  target: User; // a quién se califica

  @Column({ type: 'int' })
  puntaje: number; // 1 a 5

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}