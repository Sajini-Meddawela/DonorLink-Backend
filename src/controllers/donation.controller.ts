import { Request, Response } from "express";
import { DonationService } from "../services/donation.service";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { Role } from "@prisma/client";

export class DonationController {
  static async createDonation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const donationData = {
        ...req.body,
        donorId: userId,
        status: "completed",
        date: new Date(),
      };

      const donation = await DonationService.createDonation(donationData);
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(400).json({
        error: "Failed to create donation",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getDonationById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid donation ID" });
        return;
      }

      const donation = await DonationService.getDonationById(id);
      if (!donation) {
        res.status(404).json({ error: "Donation not found" });
        return;
      }

      res.status(200).json(donation);
    } catch (error) {
      console.error("Error fetching donation:", error);
      res.status(500).json({
        error: "Failed to fetch donation",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getDonorDonations(req: Request, res: Response): Promise<void> {
    try {
      const donorId = parseInt(req.params.donorId);
      if (isNaN(donorId)) {
        res.status(400).json({ error: "Invalid donor ID" });
        return;
      }

      const donations = await DonationService.getDonationsByDonor(donorId);
      res.status(200).json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  }

  static async getNeedDonations(req: Request, res: Response): Promise<void> {
    try {
      const needId = parseInt(req.params.needId);
      if (isNaN(needId)) {
        res.status(400).json({ error: "Invalid need ID" });
        return;
      }

      const donations = await DonationService.getDonationsByNeed(needId);
      res.status(200).json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  }

  static async updateDonationStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid donation ID" });
        return;
      }

      const { status } = req.body;
      const donation = await DonationService.updateDonationStatus(id, status);
      res.status(200).json(donation);
    } catch (error) {
      console.error("Error updating donation:", error);
      res.status(400).json({ error: "Failed to update donation" });
    }
  }

  static async deleteDonation(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid donation ID" });
        return;
      }

      await DonationService.deleteDonation(id);
      res.status(200).json({ message: "Donation deleted successfully" });
    } catch (error) {
      console.error("Error deleting donation:", error);
      res.status(400).json({ error: "Failed to delete donation" });
    }
  }

  static async getCareHomeDonations(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const careHomeId = parseInt(req.params.careHomeId);
      if (isNaN(careHomeId)) {
        res.status(400).json({ error: "Invalid care home ID" });
        return;
      }

      const donations = await DonationService.getCareHomeDonations(careHomeId);
      res.status(200).json(donations);
    } catch (error) {
      console.error("Error fetching care home donations:", error);
      res.status(500).json({ error: "Failed to fetch donations" });
    }
  }
}
