import { PrismaClient, MealDonationSlot as PrismaMealDonationSlot } from '@prisma/client';

const prisma = new PrismaClient();

export interface MealDonationSlot {
  id?: number;
  date: Date;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  status: 'Available' | 'Booked' | 'Completed';
  careHomeId: number;
  donorId?: number;
}

 export interface CalendarDay {
    date: Date;
    breakfast?: MealDonationSlot;
    lunch?: MealDonationSlot;
    dinner?: MealDonationSlot;
  }

// Helper function to convert Prisma model to DTO
function toDTO(slot: PrismaMealDonationSlot): MealDonationSlot {
  return {
    id: slot.id,
    date: slot.date,
    mealType: slot.mealType as 'Breakfast' | 'Lunch' | 'Dinner',
    status: slot.status as 'Available' | 'Booked' | 'Completed',
    careHomeId: slot.careHomeId,
    donorId: slot.donorId ?? undefined
  };
}

export const MealDonationModel = {
  async getSlots(careHomeId: number, startDate: Date, endDate: Date): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: {
        careHomeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    return slots.map(toDTO);
  },

  async createSlots(careHomeId: number, date: Date, mealTypes: string[]): Promise<MealDonationSlot[]> {
    const createdSlots = await prisma.$transaction(
      mealTypes.map(mealType => 
        prisma.mealDonationSlot.create({
          data: {
            date,
            mealType: mealType as any,
            careHomeId
          }
        })
      )
    );
    return createdSlots.map(toDTO);
  },

  async bookSlot(slotId: number, donorId: number): Promise<MealDonationSlot> {
    const slot = await prisma.mealDonationSlot.update({
      where: { id: slotId },
      data: {
        donorId,
        status: 'Booked'
      }
    });
    return toDTO(slot);
  },

  async getDonorBookings(donorId: number): Promise<MealDonationSlot[]> {
    const slots = await prisma.mealDonationSlot.findMany({
      where: { donorId }
    });
    return slots.map(toDTO);
  }
};
