"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:4173',
        process.env.FRONTEND_URL,
        process.env.APP_URL,
    ].filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
            if (allowedOrigins.includes(origin) || isLocalhost) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    });
    const port = process.env.PORT || 8000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
}
bootstrap().catch((err) => {
    console.error('Failed to start the application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map