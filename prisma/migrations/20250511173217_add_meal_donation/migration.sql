-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('Breakfast', 'Lunch', 'Dinner');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('Available', 'Booked', 'Completed');

-- CreateTable
CREATE TABLE "MealDonationSlot" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" "MealType" NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'Available',
    "careHomeId" INTEGER NOT NULL,
    "donorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealDonationSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealDonationSlot_date_mealType_careHomeId_key" ON "MealDonationSlot"("date", "mealType", "careHomeId");

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "care_homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
