import { Test, TestingModule } from '@nestjs/testing';
import { SmartleadController } from './smartlead.controller';

describe('SmartleadController', () => {
  let controller: SmartleadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmartleadController],
    }).compile();

    controller = module.get<SmartleadController>(SmartleadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
