"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});
const Roles = (...roles) => (0, common_2.SetMetadata)('roles', roles);
exports.Roles = Roles;
//# sourceMappingURL=current-user.decorator.js.map