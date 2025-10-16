import { PrismaClient, Inventory } from "@prisma/client";

const prisma = new PrismaClient();

export interface InventoryItemDTO {
  id?: number;
  itemName: string;
  category: string;
  stockLevel: number;
  reorderLevel: number;
  unit: string;
  itemDescription?: string;
  userId: number;
}

function toDTO(inventory: Inventory): InventoryItemDTO {
  return {
    id: inventory.id,
    itemName: inventory.itemName,
    category: inventory.category,
    stockLevel: inventory.stockLevel,
    reorderLevel: inventory.reorderLevel,
    unit: inventory.unit,
    itemDescription: inventory.itemDescription ?? undefined,
    userId: inventory.userId,
  };
}

export const InventoryModel = {
  async getAll(userId: number): Promise<InventoryItemDTO[]> {
    const items = await prisma.inventory.findMany({
      where: { userId },
    });
    return items.map(toDTO);
  },

  async getById(id: number, userId: number): Promise<InventoryItemDTO | null> {
    const item = await prisma.inventory.findUnique({
      where: { id, userId },
    });
    return item ? toDTO(item) : null;
  },

  async getByNameAndUser(itemName: string, userId: number): Promise<InventoryItemDTO | null> {
    const item = await prisma.inventory.findFirst({
      where: { 
        itemName: {
          equals: itemName,
          mode: 'insensitive' 
        },
        userId 
      },
    });
    return item ? toDTO(item) : null;
  },

  async create(item: Omit<InventoryItemDTO, "id">): Promise<InventoryItemDTO> {
    const createdItem = await prisma.inventory.create({
      data: {
        itemName: item.itemName,
        category: item.category,
        stockLevel: item.stockLevel,
        reorderLevel: item.reorderLevel,
        unit: item.unit,
        itemDescription: item.itemDescription ?? null,
        userId: item.userId,
      },
    });
    return toDTO(createdItem);
  },

  async update(
    id: number,
    userId: number,
    item: Partial<InventoryItemDTO>
  ): Promise<InventoryItemDTO> {
    const updatedItem = await prisma.inventory.update({
      where: { id, userId },
      data: {
        itemName: item.itemName,
        category: item.category,
        stockLevel: item.stockLevel,
        reorderLevel: item.reorderLevel,
        unit: item.unit,
        itemDescription: item.itemDescription ?? null,
      },
    });
    return toDTO(updatedItem);
  },

  async delete(id: number, userId: number): Promise<InventoryItemDTO> {
    const deletedItem = await prisma.inventory.delete({
      where: { id, userId },
    });
    return toDTO(deletedItem);
  },

  async search(query: string, userId: number): Promise<InventoryItemDTO[]> {
    const items = await prisma.inventory.findMany({
      where: {
        userId,
        OR: [
          { itemName: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
          { itemDescription: { contains: query, mode: "insensitive" } },
        ],
      },
    });
    return items.map(toDTO);
  },

  async bulkDelete(userId: number): Promise<void> {
    await prisma.donation.updateMany({
      where: {
        inventory: {
          userId: userId,
        },
      },
      data: {
        inventoryId: null,
      },
    });

    await prisma.inventory.deleteMany({
      where: { userId },
    });
  },
};