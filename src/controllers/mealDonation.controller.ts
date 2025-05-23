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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  static async createSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log("Request body:", req.body);
      const { careHomeId, date, mealTypes } = req.body;
      
      // Validation
      if (!careHomeId || !date || !mealTypes) {
        res.status(400).json({ 
          error: "Missing required fields: careHomeId, date, or mealTypes" 
        });
        return;
      }
      
      if (!Array.isArray(mealTypes)) {
        res.status(400).json({ error: "mealTypes must be an array" });
        return;
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: "Invalid date format" });
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
        if (error.code === 'P2002') {
          res.status(409).json({ 
            error: "Slot already exists for this date and meal type",
            meta: error.meta
          });
          return;
        }
        if (error.code === 'P2003') {
          res.status(404).json({ 
            error: "CareHome not found",
            meta: error.meta
          });
          return;
        }
      }

      res.status(400).json({ 
        error: "Failed to create meal slots",
        details: error instanceof Error ? error.message : "Unknown error"
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
        if (error.code === 'P2025') {
          res.status(404).json({ 
            error: "Slot not found or already booked",
            meta: error.meta
          });
          return;
        }
      }

      res.status(400).json({ 
        error: "Failed to book meal slot",
        details: error instanceof Error ? error.message : "Unknown error"
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
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}