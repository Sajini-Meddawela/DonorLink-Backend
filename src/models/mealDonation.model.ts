import {
  PrismaClient,
  MealDonationSlot as PrismaMealDonationSlot,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface MealDonationSlot {
  id?: number;
  date: Date;
  mealType: "Breakfast" | "Lunch" | "Dinner";
  status: "Available" | "Reserved" | "Booked" | "Completed" | "Cancelled";
  careHomeId: number;
  donorId?: number;
  reservationTime?: Date; 
}

export interface CalendarDay {
  date: Date;
  breakfast?: MealDonationSlot;
  lunch?: MealDonationSlot;
  dinner?: MealDonationSlot;
}

function toDTO(slot: PrismaMealDonationSlot): MealDonationSlot {
  return {
    id: slot.id,
    date: slot.date,
    mealType: slot.mealType as "Breakfast" | "Lunch" | "Dinner",
    status: slot.status as "Available" | "Reserved" | "Booked" | "Completed" | "Cancelled",
    careHomeId: slot.careHomeId,
    donorId: slot.donorId ?? undefined,
    reservationTime: slot.reservationTime ?? undefined,
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
    });
    return slots.map(toDTO);
  },

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
    });
    return toDTO(slot);
  },

  async getDonorBookings(donorId: number): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: { donorId },
    });
    return slots.map(toDTO);
  },

  async reserveSlot(slotId: number, donorId: number): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        donorId,
        status: "Reserved",
        reservationTime: new Date(),
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
