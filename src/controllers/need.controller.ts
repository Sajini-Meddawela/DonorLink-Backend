import { Request, Response } from "express";
import { NeedService } from "../services/need.service";
import { NeedItemDTO } from "../models/need.model";

export class NeedController {
  static async getAllNeeds(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      
      const items = await NeedService.getAllNeeds(userId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching needs:', error);
      res.status(500).json({ error: 'Failed to fetch needs' });
    }
  }

  static async getUserNeeds(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }
      
      const items = await NeedService.getAllNeeds(userId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching user needs:', error);
      res.status(500).json({ error: 'Failed to fetch user needs' });
    }
  }
  
  static async getNeedById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      const item = await NeedService.getNeedById(id, userId);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: "Need not found" });
      }
    } catch (error) {
      console.error("Error fetching need:", error);
      res.status(500).json({ error: "Failed to fetch need" });
    }
  }

  static async createNeed(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const needData: Omit<NeedItemDTO, "id"> = {
        ...req.body,
        userId,
      };

      const newItem = await NeedService.createNeed(needData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating need:", error);
      res.status(400).json({
        error: "Failed to create need",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const needData: Partial<NeedItemDTO> = req.body;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      const updatedItem = await NeedService.updateNeed(id, userId, needData);
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Error updating need:", error);
      res.status(400).json({
        error: "Failed to update need",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      await NeedService.deleteNeed(id, userId);
      res.status(200).json({ message: "Need deleted successfully" });
    } catch (error) {
      console.error("Error deleting need:", error);
      res.status(400).json({
        error: "Failed to delete need",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async getCareHomeNeeds(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = parseInt(req.params.careHomeId);
      if (isNaN(careHomeId)) {
        res.status(400).json({ error: "Invalid care home ID" });
        return;
      }

      const items = await NeedService.getAllNeeds(careHomeId);
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching care home needs:", error);
      res.status(500).json({ error: "Failed to fetch care home needs" });
    }
  }
}
