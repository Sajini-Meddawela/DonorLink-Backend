import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

class UserService {
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        donations: true,
        needs: true,
        inventory: true,
        offeredMealSlots: true,
        bookedMeals: true,
      },
    });
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        donations: true,
        needs: true,
        inventory: true,
        offeredMealSlots: true,
        bookedMeals: true,
      },
    });
  }

  static async updateUser(id: number, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        donations: true,
        needs: true,
        inventory: true,
        offeredMealSlots: true,
        bookedMeals: true,
      },
    });
  }

  static async deleteUser(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      include: {
        donations: true,
        needs: true,
        inventory: true,
        offeredMealSlots: true,
        bookedMeals: true,
      },
    });
  }

  static async getUsersByRole(role: Role) {
    return prisma.user.findMany({
      where: { role },
      include: {
        donations: role === Role.DONOR,
        needs: role === Role.CAREHOME,
        inventory: role === Role.CAREHOME,
        offeredMealSlots: role === Role.CAREHOME,
        bookedMeals: role === Role.DONOR,
      },
    });
  }
}

export { UserService };
