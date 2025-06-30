import { Test, TestingModule } from '@nestjs/testing';
import { N8nController } from './n8n.controller';

describe('N8nController', () => {
  let controller: N8nController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [N8nController],
    }).compile();

    controller = module.get<N8nController>(N8nController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
