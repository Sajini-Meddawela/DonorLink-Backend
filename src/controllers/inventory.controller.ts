import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventoryItemDTO } from '../models/inventory.model';

export class InventoryController {
  static async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = parseInt(req.query.careHomeId as string);
      if (isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid care home ID' });
        return;
      }
      
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
      const careHomeId = parseInt(req.query.careHomeId as string);
      
      if (isNaN(id) || isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid ID or care home ID' });
        return;
      }

      const item = await InventoryService.getItemById(id, careHomeId);
      
      if (item) {
        res.status(200).json(item);
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
      const itemData: Omit<InventoryItemDTO, 'id'> = req.body;
      
      if (!itemData.careHomeId) {
        res.status(400).json({ error: 'Care home ID is required' });
        return;
      }

      const newItem = await InventoryService.createItem(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(400).json({ 
        error: 'Failed to create inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async updateItem(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const careHomeId = parseInt(req.query.careHomeId as string) || 1; // Fallback to 1 if not provided
    const itemData: Partial<InventoryItemDTO> = req.body;

    if (isNaN(id) || isNaN(careHomeId)) {
      res.status(400).json({ error: 'Invalid ID or care home ID' });
      return;
    }

    // Ensure we don't try to update the ID or careHomeId
    const { id: _, careHomeId: __, ...updateData } = itemData;

    const updatedItem = await InventoryService.updateItem(
      id, 
      careHomeId, 
      updateData
    );
    
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(400).json({ 
      error: 'Failed to update inventory item',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

  static async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = parseInt(req.query.careHomeId as string);

      if (isNaN(id) || isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid ID or care home ID' });
        return;
      }

      const deletedItem = await InventoryService.deleteItem(id, careHomeId);
      res.status(200).json(deletedItem);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(400).json({ 
        error: 'Failed to delete inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  static async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string;
      const careHomeId = parseInt(req.query.careHomeId as string);
      
      if (!query) {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      if (isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid care home ID' });
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