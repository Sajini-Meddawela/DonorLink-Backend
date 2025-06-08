import { NeedItemDTO, NeedModel } from '../models/need.model';

export class NeedService {
  static async getAllNeeds(careHomeId: number): Promise<NeedItemDTO[]> {
    return await NeedModel.getAll(careHomeId);
  }

  static async getNeedById(id: number, careHomeId: number): Promise<NeedItemDTO | null> {
    return await NeedModel.getById(id, careHomeId);
  }

  static async createNeed(needData: Omit<NeedItemDTO, 'id'>): Promise<NeedItemDTO> {
    return await NeedModel.create(needData);
  }

  static async updateNeed(
    id: number, 
    careHomeId: number, 
    needData: Partial<NeedItemDTO>
  ): Promise<NeedItemDTO> {
    return await NeedModel.update(id, careHomeId, needData);
  }

  static async deleteNeed(id: number, careHomeId: number): Promise<NeedItemDTO> {
    return await NeedModel.delete(id, careHomeId);
  }

  static async searchNeeds(query: string, careHomeId: number): Promise<NeedItemDTO[]> {
    return await NeedModel.search(query, careHomeId);
  }
}