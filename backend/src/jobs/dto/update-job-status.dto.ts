import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../entities/job.entity';

export class UpdateJobStatusDto {
  @ApiProperty({ enum: JobStatus, example: JobStatus.ACEPTADO })
  @IsEnum(JobStatus)
  estado: JobStatus;
}