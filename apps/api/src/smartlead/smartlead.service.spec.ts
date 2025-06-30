import { Test, TestingModule } from '@nestjs/testing';
import { SmartleadService } from './smartlead.service';

describe('SmartleadService', () => {
  let service: SmartleadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmartleadService],
    }).compile();

    service = module.get<SmartleadService>(SmartleadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
