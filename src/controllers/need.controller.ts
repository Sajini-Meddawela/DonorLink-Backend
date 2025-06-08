import { Request, Response } from 'express';
import { NeedService } from '../services/need.service';
import { NeedItemDTO } from '../models/need.model';

export class NeedController {
  static async getAllNeeds(req: Request, res: Response): Promise<void> {
    try {
      const careHomeId = parseInt(req.params.careHomeId);
      if (isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid care home ID' });
        return;
      }
      
      const items = await NeedService.getAllNeeds(careHomeId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching needs:', error);
      res.status(500).json({ error: 'Failed to fetch needs' });
    }
  }

  static async getNeedById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = parseInt(req.query.careHomeId as string);
      
      if (isNaN(id) || isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid ID or care home ID' });
        return;
      }

      const item = await NeedService.getNeedById(id, careHomeId);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: 'Need not found' });
      }
    } catch (error) {
      console.error('Error fetching need:', error);
      res.status(500).json({ error: 'Failed to fetch need' });
    }
  }

  static async createNeed(req: Request, res: Response): Promise<void> {
    try {
      const needData: Omit<NeedItemDTO, 'id'> = req.body;
      if (!needData.careHomeId) {
        res.status(400).json({ error: 'Care home ID is required' });
        return;
      }

      const newItem = await NeedService.createNeed(needData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating need:', error);
      res.status(400).json({ error: 'Failed to create need' });
    }
  }

  static async updateNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = parseInt(req.query.careHomeId as string);
      const needData: Partial<NeedItemDTO> = req.body;
      
      if (isNaN(id) || isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid ID or care home ID' });
        return;
      }

      const updatedItem = await NeedService.updateNeed(id, careHomeId, needData);
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating need:', error);
      res.status(400).json({ error: 'Failed to update need' });
    }
  }

  static async deleteNeed(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const careHomeId = parseInt(req.query.careHomeId as string);
      
      if (isNaN(id) || isNaN(careHomeId)) {
        res.status(400).json({ error: 'Invalid ID or care home ID' });
        return;
      }

      const deletedItem = await NeedService.deleteNeed(id, careHomeId);
      res.status(200).json(deletedItem);
    } catch (error) {
      console.error('Error deleting need:', error);
      res.status(400).json({ error: 'Failed to delete need' });
    }
  }

  static async searchNeeds(req: Request, res: Response): Promise<void> {
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
      
      const items = await NeedService.searchNeeds(query, careHomeId);
      res.status(200).json(items);
    } catch (error) {
      console.error('Error searching needs:', error);
      res.status(500).json({ error: 'Failed to search needs' });
    }
  }
}