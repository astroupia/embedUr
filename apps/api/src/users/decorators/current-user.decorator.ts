import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user; // assumes AuthGuard has populated req.user
  },
);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
