import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { User } from '../users/entities/user.entity';
import { TechnicianProfile } from '../technician-profiles/entities/technician-profile.entity';
import { ServiceCategory } from '../service-categories/entities/service-category.entity';
import { UsersModule } from '../users/users.module';
import { TechnicianProfilesModule } from '../technician-profiles/technician-profiles.module';
import { ServiceCategoriesModule } from '../service-categories/service-categories.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Job, User, TechnicianProfile, ServiceCategory]),
    UsersModule,
    TechnicianProfilesModule,
    ServiceCategoriesModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}