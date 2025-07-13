// Controllers
export { AuthController } from './controllers/auth.controller';
export { VerificationController } from './controllers/verification.controller';
export { PasswordController } from './controllers/password.controller';

// Services
export { AuthService } from './services/auth.service';
export { MailService } from './services/mail.service';

// Repositories
export { UserRepository } from './repositories/user.repository';
export { SessionRepository } from './repositories/session.repository';
export { CompanyRepository } from './repositories/company.repository';
export { TokenRepository } from './repositories/token.repository';

// Guards
export { JwtAuthGuard } from './guards/jwt-auth.guard';
export { ApiKeyGuard } from './guards/api-key.guard';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';

// Decorators
export { CurrentUser } from './decorators/current-user.decorator';

// DTOs
export * from './dtos/user.dto';
export * from './dtos/company.dto';
export * from './dtos/login.dto';
export * from './dtos/register.dto';
export * from './dtos/verify-email.dto';
export * from './dtos/forgot-password.dto';
export * from './dtos/reset-password.dto';
export * from './dtos/refresh-token.dto';
export * from './dtos/session.dto';
export * from './dtos/token.dto';

// Entities
export { UserEntity } from './entities/user.entity';
export { CompanyEntity } from './entities/company.entity';
export { SessionEntity } from './entities/session.entity';
export { EmailVerificationEntity } from './entities/email-verification.entity';
export { PasswordResetEntity } from './entities/password-reset.entity';

// Module
export { AuthModule } from './auth.module'; 