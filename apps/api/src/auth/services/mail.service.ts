import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async sendVerification(email: string, token: string): Promise<void> {
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

  async sendPasswordReset(email: string, token: string): Promise<void> {
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
}
