export class SessionEntity {
  id: string;
  userId: string;
  refreshToken: string;
  ip: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
}
