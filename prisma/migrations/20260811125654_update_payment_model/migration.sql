/*
  Warnings:

  - A unique constraint covering the columns `[videoCallingId]` on the table `appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeEvenId]` on the table `payment` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `videoCallingId` on the `appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transactionId` on the `payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "appointment" DROP COLUMN "videoCallingId",
ADD COLUMN     "videoCallingId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "stripeEvenId" TEXT,
DROP COLUMN "transactionId",
ADD COLUMN     "transactionId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "appointment_videoCallingId_key" ON "appointment"("videoCallingId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactionId_key" ON "payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeEvenId_key" ON "payment"("stripeEvenId");

-- CreateIndex
CREATE INDEX "payment_transactionId_idx" ON "payment"("transactionId");
