import { MealDonationModel } from '../models/mealDonation.model';

export class MealDonationService {
  static async getSlots(careHomeId: number, startDate: Date, endDate: Date) {
    return MealDonationModel.getSlots(careHomeId, startDate, endDate);
  }

  static async createSlots(careHomeId: number, date: Date, mealTypes: string[]) {
    return MealDonationModel.createSlots(careHomeId, date, mealTypes);
  }

  static async bookSlot(slotId: number, donorId: number) {
    return MealDonationModel.bookSlot(slotId, donorId);
  }

  static async getDonorBookings(donorId: number) {
    return MealDonationModel.getDonorBookings(donorId);
  }
}