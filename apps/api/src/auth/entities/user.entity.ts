export class UserEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  companyId: string;
  linkedinUrl?: string;
  profileUrl?: string;
  twitterUsername?: string;
  facebookUsername?: string;
  instagramUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}
