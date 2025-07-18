"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const auth_controller_1 = require("./controllers/auth.controller");
const verification_controller_1 = require("./controllers/verification.controller");
const password_controller_1 = require("./controllers/password.controller");
const auth_service_1 = require("./services/auth.service");
const mail_service_1 = require("./services/mail.service");
const user_repository_1 = require("./repositories/user.repository");
const session_repository_1 = require("./repositories/session.repository");
const company_repository_1 = require("./repositories/company.repository");
const token_repository_1 = require("./repositories/token.repository");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const api_key_guard_1 = require("./guards/api-key.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'access-secret',
                    signOptions: { expiresIn: '15m' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController, verification_controller_1.VerificationController, password_controller_1.PasswordController],
        providers: [
            auth_service_1.AuthService,
            mail_service_1.MailService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            api_key_guard_1.ApiKeyGuard,
            user_repository_1.UserRepository,
            session_repository_1.SessionRepository,
            company_repository_1.CompanyRepository,
            token_repository_1.TokenRepository,
            {
                provide: 'JWT_REFRESH_SERVICE',
                useFactory: (configService) => {
                    const { JwtService } = require('@nestjs/jwt');
                    return new JwtService({
                        secret: configService.get('JWT_SECRET') || 'refresh-secret',
                        signOptions: { expiresIn: '7d' },
                    });
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, api_key_guard_1.ApiKeyGuard, user_repository_1.UserRepository],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map