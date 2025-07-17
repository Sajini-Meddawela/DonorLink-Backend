/*
  Warnings:

  - Added the required column `needId` to the `donations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "donations" DROP CONSTRAINT "donations_inventoryId_fkey";

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "needId" INTEGER NOT NULL,
ALTER COLUMN "inventoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_needId_fkey" FOREIGN KEY ("needId") REFERENCES "needs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
