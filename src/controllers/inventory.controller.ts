import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventoryItemDTO } from '../models/inventory.model';

export class InventoryController {
  static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      const items = await InventoryService.getAllItems();
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const item = await InventoryService.getItemById(id);
      
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const itemData: Omit<InventoryItemDTO, 'id'> = req.body;
      const newItem = await InventoryService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create inventory item' });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const itemData: Partial<InventoryItemDTO> = req.body;
      const updatedItem = await InventoryService.updateItem(id, itemData);
      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update inventory item' });
    }
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const deletedItem = await InventoryService.deleteItem(id);
      res.status(200).json(deletedItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete inventory item' });
    }
  }

  static async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }
      
      const items = await InventoryService.searchItems(query);
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search inventory items' });
    }
  }
}