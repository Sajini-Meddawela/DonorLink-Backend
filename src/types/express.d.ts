import { Role } from '@prisma/client';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}