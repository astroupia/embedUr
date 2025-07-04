export class PasswordResetEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
