import { PrismaClient, Need } from '@prisma/client';

const prisma = new PrismaClient();

export interface NeedItemDTO {
  id?: number;
  itemName: string;
  requiredQuantity: number;
  currentQuantity: number;
  category: string;
  urgencyLevel: 'High' | 'Medium' | 'Low';
  careHomeId: number;
}


function toDTO(need: Need): NeedItemDTO {
  return {
    id: need.id,
    itemName: need.itemName,
    requiredQuantity: need.requiredQuantity,
    currentQuantity: need.currentQuantity,
    category: need.category,
    urgencyLevel: need.urgencyLevel as 'High' | 'Medium' | 'Low',
    careHomeId: need.careHomeId
  };
}

export const NeedModel = {
  async getAll(careHomeId: number): Promise<NeedItemDTO[]> {
    const items = await prisma.need.findMany({ 
      where: { careHomeId } 
    });
    return items.map(toDTO);
  },

  async getById(id: number, careHomeId: number): Promise<NeedItemDTO | null> {
    const item = await prisma.need.findUnique({ 
      where: { id, careHomeId } 
    });
    return item ? toDTO(item) : null;
  },

  async create(item: Omit<NeedItemDTO, 'id'>): Promise<NeedItemDTO> {
    const createdItem = await prisma.need.create({ 
      data: {
        ...item,
        id: undefined 
      }
    });
    return toDTO(createdItem);
  },

  async update(id: number, careHomeId: number, item: Partial<NeedItemDTO>): Promise<NeedItemDTO> {
    const updatedItem = await prisma.need.update({ 
      where: { id, careHomeId }, 
      data: item
    });
    return toDTO(updatedItem);
  },

  async delete(id: number, careHomeId: number): Promise<NeedItemDTO> {
    const deletedItem = await prisma.need.delete({ 
      where: { id, careHomeId } 
    });
    return toDTO(deletedItem);
  },

  async search(query: string, careHomeId: number): Promise<NeedItemDTO[]> {
    const items = await prisma.need.findMany({
      where: {
        careHomeId,
        OR: [
          { itemName: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      }
    });
    return items.map(toDTO);
  }
};