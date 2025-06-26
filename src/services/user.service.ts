import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

class UserService {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        careHome: true,
        donor: true
      }
    });
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        careHome: true,
        donor: true
      }
    });
  }

  static async updateUser(id: number, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        careHome: true,
        donor: true
      }
    });
  }

  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      include: {
        careHome: true,
        donor: true
      }
    });
  }

  static async getUsersByRole(role: Role) {
    return prisma.user.findMany({
      where: { role },
      include: {
        careHome: role === Role.CAREHOME,
        donor: role === Role.DONOR
      }
    });
  }
}

export { UserService };