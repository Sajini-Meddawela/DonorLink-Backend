import { InventoryItemDTO, InventoryModel } from '../models/inventory.model';

export class InventoryService {
  static async getAllItems(): Promise<InventoryItemDTO[]> {
    return await InventoryModel.getAll();
  }

  static async getItemById(id: number): Promise<InventoryItemDTO | null> {
    return await InventoryModel.getById(id);
  }

  static async createItem(itemData: Omit<InventoryItemDTO, 'id'>): Promise<InventoryItemDTO> {
    return await InventoryModel.create(itemData);
  }

  static async updateItem(id: number, itemData: Partial<InventoryItemDTO>): Promise<InventoryItemDTO> {
    return await InventoryModel.update(id, itemData);
  }

  static async deleteItem(id: number): Promise<InventoryItemDTO> {
    return await InventoryModel.delete(id);
  }

  static async searchItems(query: string): Promise<InventoryItemDTO[]> {
    return await InventoryModel.search(query);
  }
}