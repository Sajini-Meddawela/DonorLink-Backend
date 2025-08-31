import {
  PrismaClient,
  MealDonationSlot as PrismaMealDonationSlot,
  User as PrismaUser,
  SlotStatus,
  MealType,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface MealDonationSlot {
  id?: number;
  date: Date;
  mealType: MealType;
  status: SlotStatus;
  careHomeId: number;
  donorId?: number | null;
  donor?: {
    id: number;
    name: string;
    email: string;
  } | null;
  reservationTime?: Date | null;
  careHome?: {
    id: number;
    name: string;
  } | null;
}

export interface CalendarDay {
  date: Date;
  breakfast?: MealDonationSlot;
  lunch?: MealDonationSlot;
  dinner?: MealDonationSlot;
}

function toDTO(slot: PrismaMealDonationSlot & {
  donor?: Pick<PrismaUser, 'id' | 'name' | 'email'> | null;
  careHome?: Pick<PrismaUser, 'id' | 'name'> | null;
}): MealDonationSlot {
  return {
    id: slot.id,
    date: slot.date,
    mealType: slot.mealType,
    status: slot.status,
    careHomeId: slot.careHomeId,
    donorId: slot.donorId ?? undefined,
    donor: slot.donor ? {
      id: slot.donor.id,
      name: slot.donor.name,
      email: slot.donor.email,
    } : undefined,
    reservationTime: slot.reservationTime ?? undefined,
    careHome: slot.careHome ? {
      id: slot.careHome.id,
      name: slot.careHome.name,
    } : undefined,
  };
}

const RESERVATION_EXPIRY_MINUTES = 15;

export const MealDonationModel = {
  async getSlots(
    careHomeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: {
        careHomeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return slots.map(toDTO);
  },

  async getCareHomeMealDonations(
    careHomeId: number
  ): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: {
        careHomeId,
        status: {
          in: ["Booked", "Completed", "Cancelled"],
        },
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        careHome: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    
    return slots.map(toDTO);
  },

  // ... rest of the methods remain the same, but ensure they all use toDTO for consistency
  async createSlots(
    careHomeId: number,
    date: Date,
    mealTypes: string[]
  ): Promise<MealDonationSlot[]> {
    const createdSlots = await prisma.$transaction(
      mealTypes.map((mealType) =>
        prisma.mealDonationSlot.create({
          data: {
            date,
            mealType: mealType as any,
            careHomeId,
          },
        })
      )
    );
    return createdSlots.map(toDTO);
  },

  async getSlotsByDateAndMealTypes(
    careHomeId: number,
    date: Date,
    mealTypes: string[]
  ): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: {
        careHomeId,
        date,
        mealType: {
          in: mealTypes as any[],
        },
      },
    });
    return slots.map(toDTO);
  },

  async getSlotById(slotId: number): Promise<MealDonationSlot | null> {
    const slot = await prisma.mealDonationSlot.findUnique({
      where: { id: slotId },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return slot ? toDTO(slot) : null;
  },

  async deleteSlot(slotId: number): Promise<void> {
    await prisma.mealDonationSlot.delete({
      where: { id: slotId },
    });
  },

  async bookSlot(slotId: number, donorId: number): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        donorId,
        status: "Booked",
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return toDTO(slot);
  },

  async updateSlotStatus(
    slotId: number,
    status: "completed" | "cancelled"
  ): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        status: status === "completed" ? "Completed" : "Cancelled",
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return toDTO(slot);
  },

  async getDonorBookings(donorId: number): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: { donorId },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return slots.map(toDTO);
  },

  async reserveSlot(
    slotId: number,
    donorId: number
  ): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        donorId,
        status: "Reserved",
        reservationTime: new Date(),
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return toDTO(slot);
  },

  async confirmSlot(slotId: number): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        status: "Booked",
        reservationTime: null,
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return toDTO(slot);
  },

  async releaseExpiredReservations(): Promise<void> {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() - RESERVATION_EXPIRY_MINUTES);

    await prisma.mealDonationSlot.updateMany({
      where: {
        status: "Reserved",
        reservationTime: {
          lt: expiryTime,
        },
      },
      data: {
        status: "Available",
        donorId: null,
        reservationTime: null,
      },
    });
  },
};