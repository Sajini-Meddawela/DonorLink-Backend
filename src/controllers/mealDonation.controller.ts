import { Request, Response } from "express";
import { MealDonationService } from "../services/mealDonation.service";
import { Prisma } from "@prisma/client";

export class MealDonationController {
  static async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = parseInt(req.query.careHomeId as string);
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (isNaN(careHomeId)) {
        res.status(400).json({ error: "Invalid careHomeId" });
        return;
      }

      const slots = await MealDonationService.getSlots(
        careHomeId,
        startDate,
        endDate
      );
      res.status(200).json(slots);
    } catch (error) {
      console.error("Error in getSlots:", error);
      res.status(500).json({
        error: "Failed to fetch meal slots",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

    static async createSlots(req: Request, res: Response): Promise<void> {
    try {
      const { careHomeId, date, mealTypes } = req.body;

      // Validation
      if (!careHomeId || !date || !mealTypes) {
        res.status(400).json({
          error: "Missing required fields: careHomeId, date, or mealTypes",
        });
        return;
      }

      if (!Array.isArray(mealTypes)) {
        res.status(400).json({ error: "mealTypes must be an array" });
        return;
      }

      const parsedDate = new Date(date);
      // Set time to midnight for accurate date comparison
      parsedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if date is in the past
      if (parsedDate < today) {
        res.status(400).json({ error: "Cannot create slots for past dates" });
        return;
      }

      // Check for existing slots to prevent duplicates
      const existingSlots = await MealDonationService.getSlotsByDateAndMealTypes(
        careHomeId,
        parsedDate,
        mealTypes
      );
      
      if (existingSlots.length > 0) {
        const existingMealTypes = existingSlots.map(slot => slot.mealType);
        res.status(409).json({ 
          error: "Slots already exist for some meal types",
          existingMealTypes 
        });
        return;
      }

      const slots = await MealDonationService.createSlots(
        careHomeId,
        parsedDate,
        mealTypes
      );

      res.status(201).json(slots);
    } catch (error) {
      console.error("Error in createSlots:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          res.status(409).json({
            error: "Slot already exists for this date and meal type",
            meta: error.meta,
          });
          return;
        }
        if (error.code === "P2003") {
          res.status(404).json({
            error: "CareHome not found",
            meta: error.meta,
          });
          return;
        }
      }

      res.status(400).json({
        error: "Failed to create meal slots",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async bookSlot(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id);
      const { donorId } = req.body;

      if (isNaN(slotId)) {
        res.status(400).json({ error: "Invalid slot ID" });
        return;
      }

      const bookedSlot = await MealDonationService.bookSlot(slotId, donorId);
      res.status(200).json(bookedSlot);
    } catch (error) {
      console.error("Error in bookSlot:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({
            error: "Slot not found or already booked",
            meta: error.meta,
          });
          return;
        }
      }

      res.status(400).json({
        error: "Failed to book meal slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getDonorBookings(req: Request, res: Response): Promise<void> {
    try {
      const donorId = parseInt(req.query.donorId as string);

      if (isNaN(donorId)) {
        res.status(400).json({ error: "Invalid donorId" });
        return;
      }

      const bookings = await MealDonationService.getDonorBookings(donorId);
      res.status(200).json(bookings);
    } catch (error) {
      console.error("Error in getDonorBookings:", error);
      res.status(500).json({
        error: "Failed to fetch donor bookings",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateSlotStatus(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(slotId)) {
        res.status(400).json({ error: "Invalid slot ID" });
        return;
      }

      if (!status || !["completed", "cancelled"].includes(status)) {
        res
          .status(400)
          .json({
            error: "Invalid status. Must be 'completed' or 'cancelled'",
          });
        return;
      }

      const updatedSlot = await MealDonationService.updateSlotStatus(
        slotId,
        status
      );
      res.status(200).json(updatedSlot);
    } catch (error) {
      console.error("Error in updateSlotStatus:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          res.status(404).json({
            error: "Slot not found",
            meta: error.meta,
          });
          return;
        }
      }

      res.status(400).json({
        error: "Failed to update slot status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteSlot(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id);
      
      if (isNaN(slotId)) {
        res.status(400).json({ error: "Invalid slot ID" });
        return;
      }

      const slot = await MealDonationService.getSlotById(slotId);
      
      if (!slot) {
        res.status(404).json({ error: "Slot not found" });
        return;
      }
      
      if (slot.status !== "Available") {
        res.status(400).json({ 
          error: "Cannot delete a slot that is not available" 
        });
        return;
      }

      await MealDonationService.deleteSlot(slotId);
      res.status(200).json({ message: "Slot deleted successfully" });
    } catch (error) {
      console.error("Error in deleteSlot:", error);
      res.status(500).json({
        error: "Failed to delete meal slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async reserveSlot(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id);
      const { donorId } = req.body;

      if (isNaN(slotId)) {
        res.status(400).json({ error: "Invalid slot ID" });
        return;
      }

      const reservedSlot = await MealDonationService.reserveSlot(slotId, donorId);
      res.status(200).json(reservedSlot);
    } catch (error) {
      console.error("Error in reserveSlot:", error);
      res.status(400).json({
        error: "Failed to reserve meal slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async confirmSlot(req: Request, res: Response): Promise<void> {
    try {
      const slotId = parseInt(req.params.id);

      if (isNaN(slotId)) {
        res.status(400).json({ error: "Invalid slot ID" });
        return;
      }

      const confirmedSlot = await MealDonationService.confirmSlot(slotId);
      res.status(200).json(confirmedSlot);
    } catch (error) {
      console.error("Error in confirmSlot:", error);
      res.status(400).json({
        error: "Failed to confirm meal slot",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}