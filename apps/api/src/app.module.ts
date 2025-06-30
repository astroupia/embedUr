// src/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import other feature modules here
import { LeadsModule } from './leads/leads.module';
import { AiModule } from './ai/ai.module';
import { N8nModule } from './n8n/n8n.module';
import { SmartleadModule } from './smartlead/smartlead.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    LeadsModule,
    AiModule,
    N8nModule,
    SmartleadModule,
    // …any other modules
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
