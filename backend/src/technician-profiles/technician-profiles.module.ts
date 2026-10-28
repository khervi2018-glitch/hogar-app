import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianProfilesService } from './technician-profiles.service';
import { TechnicianProfilesController } from './technician-profiles.controller';
import { TechnicianProfile } from './entities/technician-profile.entity';
import { UsersModule } from '../users/users.module';
import { ServiceCategoriesModule } from '../service-categories/service-categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TechnicianProfile]),
    UsersModule,
    ServiceCategoriesModule,
  ],
  controllers: [TechnicianProfilesController],
  providers: [TechnicianProfilesService],
  exports: [TypeOrmModule], // <- agregado
})
export class TechnicianProfilesModule {}