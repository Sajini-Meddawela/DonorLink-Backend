// src/services/auth.service.ts
import { PrismaClient, Role, CareHomeCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from './user.service';

const prisma = new PrismaClient();
const saltRounds = 10;

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  registrationNo?: string;
  category?: CareHomeCategory;
  address?: string;
}

class AuthService {
  static async registerUser(userData: RegisterUserData) {
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Ensure category is valid for CAREHOME role
    const category = userData.role === 'CAREHOME' 
      ? userData.category || CareHomeCategory.GENERAL 
      : undefined;

    return prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        role: userData.role,
        registrationNo: userData.registrationNo,
        category: category,
        address: userData.address,
        ...(userData.role === Role.CAREHOME && {
          careHome: {
            create: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address || '',
              registrationNo: userData.registrationNo || '',
              category: category || CareHomeCategory.GENERAL
            }
          }
        }),
        ...(userData.role === Role.DONOR && {
          donor: {
            create: {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address || ''
            }
          }
        })
      }
    });
  }

  // ... rest of the methods remain the same
  static async comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async generateVerificationToken(userId: number) {
    const token = uuidv4();
    await prisma.user.update({
      where: { id: userId },
      data: { verificationToken: token }
    });
    return token;
  }

  static async verifyUserEmail(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        isVerified: true,
        verificationToken: null 
      }
    });
  }

  static async generatePasswordResetToken(email: string) {
    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: { 
        resetToken: token,
        resetTokenExpiry: expiry 
      }
    });

    return token;
  }

  static async resetUserPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { 
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } 
      }
    });

    if (!user) return null;

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    return prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null 
      }
    });
  }
}

export { AuthService };