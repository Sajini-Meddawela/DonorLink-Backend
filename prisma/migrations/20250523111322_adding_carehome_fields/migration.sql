/*
  Warnings:

  - A unique constraint covering the columns `[registrationNo]` on the table `care_homes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `care_homes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNo` to the `care_homes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CareHomeCategory" AS ENUM ('CHILDREN', 'ADULTS', 'SENIORS', 'DISABLED', 'GENERAL');

-- AlterTable
ALTER TABLE "care_homes" ADD COLUMN     "category" "CareHomeCategory" NOT NULL,
ADD COLUMN     "registrationNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "care_homes_registrationNo_key" ON "care_homes"("registrationNo");
