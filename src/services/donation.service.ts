import { DonationModel } from "../models/donation.model";
import { DonationDTO } from "../models/donation.model";
import { NeedService } from "./need.service";

export class DonationService {
  static async createDonation(
    donationData: Omit<DonationDTO, "id">
  ): Promise<DonationDTO> {
    try {
      // First verify the need exists
      const need = await NeedService.getNeedById(donationData.needId);
      if (!need) {
        throw new Error("Need not found");
      }

      // Create the donation record
      const donation = await DonationModel.create({
        ...donationData,
        status: "completed",
      });

      // Update the need's current quantity
      const newCurrentQuantity = need.currentQuantity + donationData.quantity;
      await NeedService.updateNeed(donationData.needId, need.userId, {
        currentQuantity: newCurrentQuantity,
      });

      return donation;
    } catch (error) {
      console.error("Error in donation creation:", error);
      throw error;
    }
  }

  static async getDonationById(id: number): Promise<DonationDTO | null> {
    return DonationModel.getById(id);
  }

  static async getDonationsByDonor(donorId: number): Promise<DonationDTO[]> {
    return DonationModel.getByDonorId(donorId);
  }

  static async getDonationsByNeed(needId: number): Promise<DonationDTO[]> {
    return DonationModel.getByNeedId(needId);
  }

  static async updateDonationStatus(
    id: number,
    status: string
  ): Promise<DonationDTO> {
    return DonationModel.update(id, { status });
  }

  static async deleteDonation(id: number): Promise<void> {
    await DonationModel.delete(id);
  }
}
