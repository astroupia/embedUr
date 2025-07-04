"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const sgMail = require("@sendgrid/mail");
let MailService = class MailService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    }
    async sendVerification(email, token) {
        const url = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify?token=${token}`;
        await sgMail.send({
            to: email,
            from: process.env.MAIL_FROM || 'noreply@example.com',
            subject: 'Verify your email address',
            html: `
        <h2>Welcome to our platform!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 24 hours.</p>
      `,
        });
    }
    async sendPasswordReset(email, token) {
        const url = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
        await sgMail.send({
            to: email,
            from: process.env.MAIL_FROM || 'noreply@example.com',
            subject: 'Reset your password',
            html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${url}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map