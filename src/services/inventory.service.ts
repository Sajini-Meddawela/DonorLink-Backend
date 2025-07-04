import { InventoryItemDTO, InventoryModel } from "../models/inventory.model";

export class InventoryService {
  static async getAllItems(userId: number): Promise<InventoryItemDTO[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return await InventoryModel.getAll(userId);
  }

  static async getItemById(
    id: number,
    userId: number
  ): Promise<InventoryItemDTO | null> {
    return await InventoryModel.getById(id, userId);
  }

  static async createItem(
    itemData: Omit<InventoryItemDTO, "id">
  ): Promise<InventoryItemDTO> {
    if (!itemData.userId) {
      throw new Error("User ID is required");
    }
    return await InventoryModel.create(itemData);
  }

  static async updateItem(
    id: number,
    userId: number,
    itemData: Partial<InventoryItemDTO>
  ): Promise<InventoryItemDTO> {
    return await InventoryModel.update(id, userId, itemData);
  }

  static async deleteItem(
    id: number,
    userId: number
  ): Promise<InventoryItemDTO> {
    return await InventoryModel.delete(id, userId);
  }

  static async searchItems(
    query: string,
    userId: number
  ): Promise<InventoryItemDTO[]> {
    return await InventoryModel.search(query, userId);
  }
}
