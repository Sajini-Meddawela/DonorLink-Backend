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

-- AddForeignKey
ALTER TABLE "needs" ADD CONSTRAINT "needs_careHomeId_fkey" FOREIGN KEY ("careHomeId") REFERENCES "care_homes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
