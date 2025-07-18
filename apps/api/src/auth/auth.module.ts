import { Module, Inject } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { VerificationController } from './controllers/verification.controller';
import { PasswordController } from './controllers/password.controller';

// Services
import { AuthService } from './services/auth.service';
import { MailService } from './services/mail.service';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { SessionRepository } from './repositories/session.repository';
import { CompanyRepository } from './repositories/company.repository';
import { TokenRepository } from './repositories/token.repository';

// Strategies & Guards
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'access-secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, VerificationController, PasswordController],
  providers: [
    AuthService,
    MailService,
    JwtStrategy,
    JwtAuthGuard,
    ApiKeyGuard,
    UserRepository,
    SessionRepository,
    CompanyRepository,
    TokenRepository,
    // Add a separate JWT service for refresh tokens
    {
      provide: 'JWT_REFRESH_SERVICE',
      useFactory: (configService: ConfigService) => {
        const { JwtService } = require('@nestjs/jwt');
        return new JwtService({
          secret: configService.get('JWT_SECRET') || 'refresh-secret',
          signOptions: { expiresIn: '7d' },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, JwtAuthGuard, ApiKeyGuard, UserRepository],
})
export class AuthModule {}
