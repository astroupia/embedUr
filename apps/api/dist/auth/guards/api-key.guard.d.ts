import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class ApiKeyGuard implements CanActivate {
    private readonly logger;
    canActivate(context: ExecutionContext): boolean;
}
