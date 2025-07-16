import { PrismaClient, Donation } from '@prisma/client';

const prisma = new PrismaClient();

export interface DonationDTO {
  id?: number;
  quantity: number;
  date: Date;
  status: string;
  notes?: string | null;
  donorId: number;
  needId: number;
  inventoryId?: number | null;
}

function toDTO(donation: Donation): DonationDTO {
  return {
    id: donation.id,
    quantity: donation.quantity,
    date: donation.date,
    status: donation.status,
    notes: donation.notes,
    donorId: donation.donorId,
    needId: donation.needId,
    inventoryId: donation.inventoryId
  };
}

export const DonationModel = {
  async create(donationData: Omit<DonationDTO, 'id'>): Promise<DonationDTO> {
    const createdDonation = await prisma.donation.create({
      data: {
        quantity: donationData.quantity,
        date: donationData.date,
        status: donationData.status,
        notes: donationData.notes,
        donorId: donationData.donorId,
        needId: donationData.needId,
        inventoryId: donationData.inventoryId
      },
      include: {
        donor: true,
        need: true,
        inventory: {
          include: {
            user: true
          }
        }
      }
    });
    
    return toDTO(createdDonation);
  },

  async getById(id: number): Promise<DonationDTO | null> {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor: true,
        need: true,
        inventory: {
          include: {
            user: true
          }
        }
      }
    });
    return donation ? toDTO(donation) : null;
  },

  async update(
    id: number,
    donationData: Partial<DonationDTO>
  ): Promise<DonationDTO> {
    const updatedDonation = await prisma.donation.update({
      where: { id },
      data: donationData,
      include: {
        donor: true,
        need: true,
        inventory: true
      }
    });
    return toDTO(updatedDonation);
  },

  async delete(id: number): Promise<void> {
    await prisma.donation.delete({
      where: { id }
    });
  },

  async getByDonorId(donorId: number): Promise<DonationDTO[]> {
    const donations = await prisma.donation.findMany({
      where: { donorId },
      include: {
        donor: true,
        need: true,
        inventory: true
      }
    });
    return donations.map(toDTO);
  },

  async getByNeedId(needId: number): Promise<DonationDTO[]> {
    const donations = await prisma.donation.findMany({
      where: { needId },
      include: {
        donor: true,
        need: true,
        inventory: true
      }
    });
    return donations.map(toDTO);
  }
};