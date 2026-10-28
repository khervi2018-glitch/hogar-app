import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianProfilesService } from './technician-profiles.service';

describe('TechnicianProfilesService', () => {
  let service: TechnicianProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TechnicianProfilesService],
    }).compile();

    service = module.get<TechnicianProfilesService>(TechnicianProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
