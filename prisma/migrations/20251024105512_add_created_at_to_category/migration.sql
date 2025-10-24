/*
  Warnings:

  - A unique constraint covering the columns `[companyId,consentType]` on the table `CompanyConsent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,consentType]` on the table `UserConsent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "public"."CompanySubscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "paytrTransactionId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanySubscription_orderId_key" ON "public"."CompanySubscription"("orderId");

-- CreateIndex
CREATE INDEX "CompanySubscription_companyId_status_idx" ON "public"."CompanySubscription"("companyId", "status");

-- CreateIndex
CREATE INDEX "CompanySubscription_orderId_idx" ON "public"."CompanySubscription"("orderId");

-- CreateIndex
CREATE INDEX "CompanySubscription_expiresAt_idx" ON "public"."CompanySubscription"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyConsent_companyId_consentType_key" ON "public"."CompanyConsent"("companyId", "consentType");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_userId_consentType_key" ON "public"."UserConsent"("userId", "consentType");

-- AddForeignKey
ALTER TABLE "public"."CompanySubscription" ADD CONSTRAINT "CompanySubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
