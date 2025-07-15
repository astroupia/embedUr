import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AIPersonaController } from './ai-persona.controller';
import { AIPersonaService } from './ai-persona.service';
import { AIPersonaRepository } from './ai-persona.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AIPersonaController],
  providers: [AIPersonaService, AIPersonaRepository],
  exports: [AIPersonaService],
})
export class AIPersonaModule {} 