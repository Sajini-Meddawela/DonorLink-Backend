-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONOR', 'CAREHOME');

-- CreateEnum
CREATE TYPE "CareHomeCategory" AS ENUM ('CHILDREN', 'ADULTS', 'SENIORS', 'DISABLED', 'GENERAL');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('Breakfast', 'Lunch', 'Dinner');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('Available', 'Booked', 'Completed');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DONOR',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "registrationNo" TEXT,
    "category" "CareHomeCategory",

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stockLevel" INTEGER NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "itemDescription" TEXT,
    "careHomeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_homes" (
    "id" SERIAL NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" "CareHomeCategory" NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_homes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "donorId" INTEGER NOT NULL,
    "inventoryId" INTEGER NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "needs" (
    "id" SERIAL NOT NULL,
    "itemName" TEXT NOT NULL,
    "requiredQuantity" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "urgencyLevel" VARCHAR(10) NOT NULL,
    "careHomeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "needs_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "care_homes_registrationNo_key" ON "care_homes"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "care_homes_userId_key" ON "care_homes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "donors_userId_key" ON "donors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MealDonationSlot_date_mealType_careHomeId_key" ON "MealDonationSlot"("date", "mealType", "careHomeId");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "care_homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_homes" ADD CONSTRAINT "care_homes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "needs" ADD CONSTRAINT "needs_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "care_homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "care_homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealDonationSlot" ADD CONSTRAINT "MealDonationSlot_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
