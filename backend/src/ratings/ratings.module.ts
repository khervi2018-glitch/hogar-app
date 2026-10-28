import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './entities/rating.entity';
import { Job } from '../jobs/entities/job.entity';
import { TechnicianProfile } from '../technician-profiles/entities/technician-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Job, TechnicianProfile])],
  providers: [RatingsService],
  controllers: [RatingsController],
})
export class RatingsModule {}