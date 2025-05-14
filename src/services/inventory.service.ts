import { InventoryItemDTO, InventoryModel } from '../models/inventory.model';

export class InventoryService {
  static async getAllItems(careHomeId: number): Promise<InventoryItemDTO[]> {
    return await InventoryModel.getAll(careHomeId);
  }

  static async getItemById(id: number, careHomeId: number): Promise<InventoryItemDTO | null> {
    return await InventoryModel.getById(id, careHomeId);
  }

  static async createItem(itemData: Omit<InventoryItemDTO, 'id'>): Promise<InventoryItemDTO> {
    return await InventoryModel.create(itemData);
  }

  static async updateItem(id: number, careHomeId: number, itemData: Partial<InventoryItemDTO>): Promise<InventoryItemDTO> {
    return await InventoryModel.update(id, careHomeId, itemData);
  }

  static async deleteItem(id: number, careHomeId: number): Promise<InventoryItemDTO> {
    return await InventoryModel.delete(id, careHomeId);
  }

  static async searchItems(query: string, careHomeId: number): Promise<InventoryItemDTO[]> {
    return await InventoryModel.search(query, careHomeId);
  }
}