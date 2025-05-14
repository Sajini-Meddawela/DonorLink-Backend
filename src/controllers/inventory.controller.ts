import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventoryItemDTO } from '../models/inventory.model';

export class InventoryController {
  static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = 1;
      const items = await InventoryService.getAllItems(careHomeId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  }

  static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = 1; 
      const item = await InventoryService.getItemById(id, careHomeId);
      
      if (item) {
        res.status(200).json({
          id: item.id,
          itemName: item.itemName,
          category: item.category,
          stockLevel: item.stockLevel,
          reorderLevel: item.reorderLevel,
          itemDescription: item.itemDescription || ''
        });
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = 1;
      const itemData: Omit<InventoryItemDTO, 'id'> = { ...req.body, careHomeId };
      const newItem = await InventoryService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(400).json({ error: 'Failed to create inventory item' });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = 1;
      const itemData: Partial<InventoryItemDTO> = req.body;
      const updatedItem = await InventoryService.updateItem(id, careHomeId, itemData);
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(400).json({ error: 'Failed to update inventory item' });
    }
  }

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = 1;
      const deletedItem = await InventoryService.deleteItem(id, careHomeId);
      res.status(200).json(deletedItem);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(400).json({ error: 'Failed to delete inventory item' });
    }
  }

  static async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const careHomeId = 1;
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }
      
      const items = await InventoryService.searchItems(query, careHomeId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error searching inventory items:', error);
      res.status(500).json({ error: 'Failed to search inventory items' });
    }
  }
}