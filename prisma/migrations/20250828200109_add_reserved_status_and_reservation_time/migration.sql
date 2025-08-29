-- AlterEnum
ALTER TYPE "SlotStatus" ADD VALUE 'Reserved';

-- AlterTable
ALTER TABLE "MealDonationSlot" ADD COLUMN     "reservationTime" TIMESTAMP(3);
