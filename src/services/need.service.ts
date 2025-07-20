import { NeedItemDTO, NeedModel } from "../models/need.model";

export class NeedService {
  static async getAllNeeds(userId: number): Promise<NeedItemDTO[]> {
    return await NeedModel.getAll(userId);
  }

  static async getNeedById(id: number): Promise<NeedItemDTO | null> {
    return await NeedModel.getById(id);
  }

  static async createNeed(
    needData: Omit<NeedItemDTO, "id">
  ): Promise<NeedItemDTO> {
    return await NeedModel.create(needData);
  }

  static async updateNeed(
    id: number,
    userId: number,
    needData: Partial<NeedItemDTO>
  ): Promise<NeedItemDTO> {
    try {
      const updatedItem = await NeedModel.update(id, userId, needData);
      return updatedItem;
    } catch (error) {
      console.error("Error updating need:", error);
      throw error;
    }
  }

  static async deleteNeed(id: number, userId: number): Promise<void> {
    await NeedModel.delete(id, userId);
  }

  static async getCareHomeNeeds(careHomeId: number): Promise<NeedItemDTO[]> {
    return await NeedModel.getAll(careHomeId);
  }
}
