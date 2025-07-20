import { PrismaClient, Donation, User, Need } from "@prisma/client";

const prisma = new PrismaClient();

export interface DonorDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
}

export interface NeedDTO {
  id: number;
  itemName: string;
  requiredQuantity: number;
  currentQuantity: number;
  category: string;
  urgencyLevel: string;
  userId: number;
}

export interface DonationDTO {
  id?: number;
  quantity: number;
  date: Date;
  status: string;
  notes?: string | null;
  donorId: number;
  needId: number;
  inventoryId?: number | null;
  donor?: DonorDTO;
  need?: NeedDTO;
}

function toDTO(
  donation: Donation & {
    donor?: User;
    need?: Need & { user?: User };
  }
): DonationDTO {
  return {
    id: donation.id,
    quantity: donation.quantity,
    date: donation.date,
    status: donation.status,
    notes: donation.notes,
    donorId: donation.donorId,
    needId: donation.needId,
    inventoryId: donation.inventoryId,
    donor: donation.donor
      ? {
          id: donation.donor.id,
          name: donation.donor.name,
          email: donation.donor.email,
          phone: donation.donor.phone,
          address: donation.donor.address,
        }
      : undefined,
    need: donation.need
      ? {
          id: donation.need.id,
          itemName: donation.need.itemName,
          requiredQuantity: donation.need.requiredQuantity,
          currentQuantity: donation.need.currentQuantity,
          category: donation.need.category,
          urgencyLevel: donation.need.urgencyLevel,
          userId: donation.need.userId,
        }
      : undefined,
  };
}

export const DonationModel = {
  async create(donationData: Omit<DonationDTO, "id">): Promise<DonationDTO> {
    const createdDonation = await prisma.donation.create({
      data: {
        quantity: donationData.quantity,
        date: donationData.date,
        status: donationData.status,
        notes: donationData.notes,
        donorId: donationData.donorId,
        needId: donationData.needId,
        inventoryId: donationData.inventoryId,
      },
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
    });

    return toDTO(createdDonation);
  },

  async getById(id: number): Promise<DonationDTO | null> {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!donation) return null;

    return toDTO(donation);
  },

  async update(
    id: number,
    donationData: {
      quantity?: number;
      date?: Date;
      status?: string;
      notes?: string | null;
      donorId?: number;
      needId?: number;
      inventoryId?: number | null;
    }
  ): Promise<DonationDTO> {
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: donationData,
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
    });
    return toDTO(updatedDonation);
  },

  async delete(id: number): Promise<void> {
    await prisma.donation.delete({
      where: { id },
    });
  },

  async getByDonorId(donorId: number): Promise<DonationDTO[]> {
    const donations = await prisma.donation.findMany({
      where: { donorId },
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
    });
    return donations.map(toDTO);
  },

  async getByNeedId(needId: number): Promise<DonationDTO[]> {
    const donations = await prisma.donation.findMany({
      where: { needId },
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
    });
    return donations.map(toDTO);
  },

  async getByCareHomeId(careHomeId: number): Promise<DonationDTO[]> {
    const donations = await prisma.donation.findMany({
      where: {
        need: {
          userId: careHomeId,
        },
      },
      include: {
        donor: true,
        need: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return donations.map(toDTO);
  },
};
