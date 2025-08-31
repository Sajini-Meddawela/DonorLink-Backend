import { MealDonationModel } from "../models/mealDonation.model";
import { NotificationService } from "./notification.service";

export class MealDonationService {
  static async getSlots(careHomeId: number, startDate: Date, endDate: Date) {
    return MealDonationModel.getSlots(careHomeId, startDate, endDate);
  }

  static async createSlots(
    careHomeId: number,
    date: Date,
    mealTypes: string[]
  ) {
    return MealDonationModel.createSlots(careHomeId, date, mealTypes);
  }

  static async getSlotsByDateAndMealTypes(
    careHomeId: number,
    date: Date,
    mealTypes: string[]
  ) {
    return MealDonationModel.getSlotsByDateAndMealTypes(
      careHomeId,
      date,
      mealTypes
    );
  }

  static async getSlotById(slotId: number) {
    return MealDonationModel.getSlotById(slotId);
  }

  static async deleteSlot(slotId: number) {
    return MealDonationModel.deleteSlot(slotId);
  }

  static async bookSlot(slotId: number, donorId: number): Promise<any> {
    const slot = await MealDonationModel.bookSlot(slotId, donorId);

    await NotificationService.createMealBookingNotification(
      donorId,
      slot.mealType,
      new Date(slot.date).toLocaleDateString(),
      slot.id!
    );

    return slot;
  }

  static async getDonorBookings(donorId: number) {
    return MealDonationModel.getDonorBookings(donorId);
  }

  static async updateSlotStatus(
    slotId: number,
    status: "completed" | "cancelled"
  ) {
    return MealDonationModel.updateSlotStatus(slotId, status);
  }

  static async reserveSlot(slotId: number, donorId: number) {
    await MealDonationModel.releaseExpiredReservations();

    return MealDonationModel.reserveSlot(slotId, donorId);
  }

  static async confirmSlot(slotId: number) {
    return MealDonationModel.confirmSlot(slotId);
  }

  static async getCareHomeMealDonations(careHomeId: number) {
    return MealDonationModel.getCareHomeMealDonations(careHomeId);
  }
}
