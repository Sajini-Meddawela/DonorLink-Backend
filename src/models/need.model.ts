import { PrismaClient, Need } from "@prisma/client";

const prisma = new PrismaClient();

export interface NeedItemDTO {
  id?: number;
  itemName: string;
  requiredQuantity: number;
  currentQuantity: number;
  category: string;
  urgencyLevel: "High" | "Medium" | "Low";
  userId: number;
}

function toDTO(need: Need): NeedItemDTO {
  return {
    id: need.id,
    itemName: need.itemName,
    requiredQuantity: need.requiredQuantity,
    currentQuantity: need.currentQuantity,
    category: need.category,
    urgencyLevel: need.urgencyLevel as "High" | "Medium" | "Low",
    userId: need.userId,
  };
}

export const NeedModel = {
  async getAll(userId: number): Promise<NeedItemDTO[]> {
    const items = await prisma.need.findMany({
      where: { userId },
    });
    return items.map(toDTO);
  },

  async getById(id: number, userId: number): Promise<NeedItemDTO | null> {
    const item = await prisma.need.findUnique({
      where: { id, userId },
    });
    return item ? toDTO(item) : null;
  },

  async create(item: Omit<NeedItemDTO, "id">): Promise<NeedItemDTO> {
    const createdItem = await prisma.need.create({
      data: {
        ...item,
        id: undefined,
      },
    });
    return toDTO(createdItem);
  },

  async update(
    id: number,
    userId: number,
    item: Partial<NeedItemDTO>
  ): Promise<NeedItemDTO> {
    const updatedItem = await prisma.need.update({
      where: { id, userId },
      data: item,
    });
    return toDTO(updatedItem);
  },

  async delete(id: number, userId: number): Promise<NeedItemDTO> {
    const deletedItem = await prisma.need.delete({
      where: { id, userId },
    });
    return toDTO(deletedItem);
  },

  async search(query: string, userId: number): Promise<NeedItemDTO[]> {
    const items = await prisma.need.findMany({
      where: {
        userId,
        OR: [
          { itemName: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
    });
    return items.map(toDTO);
  },
};