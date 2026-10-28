import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianProfilesController } from './technician-profiles.controller';
import { TechnicianProfilesService } from './technician-profiles.service';

describe('TechnicianProfilesController', () => {
  let controller: TechnicianProfilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicianProfilesController],
      providers: [TechnicianProfilesService],
    }).compile();

    controller = module.get<TechnicianProfilesController>(TechnicianProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
