import { PartialType } from '@nestjs/swagger';
import { CreateTechnicianProfileDto } from './create-technician-profile.dto';

export class UpdateTechnicianProfileDto extends PartialType(
  CreateTechnicianProfileDto,
) {}
