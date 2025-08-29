import { MealDonationModel } from "../models/mealDonation.model";

export class ReservationCleanupService {
  static async cleanupExpiredReservations() {
    try {
      await MealDonationModel.releaseExpiredReservations();
      console.log("Expired reservations cleaned up successfully");
    } catch (error) {
      console.error("Error cleaning up expired reservations:", error);
    }
  }
}