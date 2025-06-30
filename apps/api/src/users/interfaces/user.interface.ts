export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
