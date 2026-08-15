/*
  Warnings:

  - You are about to drop the column `gerder` on the `patient_health_data` table. All the data in the column will be lost.
  - Added the required column `gender` to the `patient_health_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patient_health_data" DROP COLUMN "gerder",
ADD COLUMN     "gender" "Gender" NOT NULL;
