import { Module } from '@nestjs/common';
import { SmartleadController } from './smartlead.controller';
import { SmartleadService } from './smartlead.service';

@Module({
  controllers: [SmartleadController],
  providers: [SmartleadService]
})
export class SmartleadModule {}
