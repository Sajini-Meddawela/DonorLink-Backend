import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service";
import { InventoryItemDTO } from "../models/inventory.model";

export class InventoryController {
  static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const items = await InventoryService.getAllItems(userId);
      res.status(200).json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      const item = await InventoryService.getItemById(id, userId);

      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ error: "Failed to fetch inventory item" });
    }
  }

  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const itemData: Omit<InventoryItemDTO, "id"> = {
        ...req.body,
        userId, // Set the userId from authenticated user
      };

      const newItem = await InventoryService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({
        error: "Failed to create inventory item",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const itemData: Partial<InventoryItemDTO> = req.body;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      // Ensure we don't try to update the ID or userId
      const { id: _, userId: __, ...updateData } = itemData;

      const updatedItem = await InventoryService.updateItem(
        id,
        userId,
        updateData
      );

      res.status(200).json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(400).json({
        error: "Failed to update inventory item",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;

      if (isNaN(id) || !userId) {
        res.status(400).json({ error: "Invalid ID or unauthorized" });
        return;
      }

      const deletedItem = await InventoryService.deleteItem(id, userId);
      res.status(200).json(deletedItem);
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(400).json({
        error: "Failed to delete inventory item",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  static async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const userId = req.user?.id;

      if (!query) {
        res.status(400).json({ error: "Search query is required" });
        return;
      }

      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const items = await InventoryService.searchItems(query, userId);
      res.status(200).json(items);
    } catch (error) {
      console.error("Error searching inventory items:", error);
      res.status(500).json({ error: "Failed to search inventory items" });
    }
  }
}
