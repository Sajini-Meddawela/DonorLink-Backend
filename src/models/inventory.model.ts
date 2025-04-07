import { PrismaClient, Inventory } from '@prisma/client';

const prisma = new PrismaClient();

export interface InventoryItemDTO {
  id?: number;
  itemName: string;
  category: string;
  stockLevel: number;
  reorderLevel: number;
  itemDescription?: string;
}

function toDTO(inventory: Inventory): InventoryItemDTO {
  return {
    id: inventory.id,
    itemName: inventory.itemName,
    category: inventory.category,
    stockLevel: inventory.stockLevel,
    reorderLevel: inventory.reorderLevel,
    itemDescription: inventory.itemDescription ?? undefined
  };
}

export const InventoryModel = {
  async getAll(): Promise<InventoryItemDTO[]> {
    const items = await prisma.inventory.findMany();
    return items.map(toDTO);
  },

  async getById(id: number): Promise<InventoryItemDTO | null> {
    const item = await prisma.inventory.findUnique({ where: { id } });
    return item ? toDTO(item) : null;
  },

  async create(item: Omit<InventoryItemDTO, 'id'>): Promise<InventoryItemDTO> {
    const createdItem = await prisma.inventory.create({ 
      data: {
        ...item,
        itemDescription: item.itemDescription ?? null
      }
    });
    return toDTO(createdItem);
  },

  async update(id: number, item: Partial<InventoryItemDTO>): Promise<InventoryItemDTO> {
    const updatedItem = await prisma.inventory.update({ 
      where: { id }, 
      data: {
        ...item,
        itemDescription: item.itemDescription ?? null
      }
    });
    return toDTO(updatedItem);
  },

  async delete(id: number): Promise<InventoryItemDTO> {
    const deletedItem = await prisma.inventory.delete({ where: { id } });
    return toDTO(deletedItem);
  },

  async search(query: string): Promise<InventoryItemDTO[]> {
    const items = await prisma.inventory.findMany({
      where: {
        OR: [
          { itemName: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
          { itemDescription: { contains: query, mode: 'insensitive' } }
        ]
      }
    });
    return items.map(toDTO);
  }
};