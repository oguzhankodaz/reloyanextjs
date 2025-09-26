/*
  Warnings:

  - You are about to drop the column `pointsOnSell` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `pointsToBuy` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `pointsEarned` on the `Purchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "pointsOnSell",
DROP COLUMN "pointsToBuy",
ADD COLUMN     "cashback" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Purchase" DROP COLUMN "pointsEarned",
ADD COLUMN     "cashbackEarned" DOUBLE PRECISION NOT NULL DEFAULT 0;
