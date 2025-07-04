/*
  Warnings:

  - You are about to drop the column `careHomeId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `careHomeId` on the `needs` table. All the data in the column will be lost.
  - You are about to drop the `care_homes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `donors` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `needs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MealDonationSlot" DROP CONSTRAINT "MealDonationSlot_careHomeId_fkey";

-- DropForeignKey
ALTER TABLE "MealDonationSlot" DROP CONSTRAINT "MealDonationSlot_donorId_fkey";

-- DropForeignKey
ALTER TABLE "care_homes" DROP CONSTRAINT "care_homes_userId_fkey";

-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_donorId_fkey";

-- DropForeignKey
ALTER TABLE "donors" DROP CONSTRAINT "donors_userId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_careHomeId_fkey";

-- DropForeignKey
ALTER TABLE "needs" DROP CONSTRAINT "needs_careHomeId_fkey";

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "careHomeId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "needs" DROP COLUMN "careHomeId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "care_homes";

-- DropTable
DROP TABLE "donors";

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "needs" ADD CONSTRAINT "needs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
