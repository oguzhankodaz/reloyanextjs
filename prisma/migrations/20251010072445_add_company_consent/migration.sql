-- CreateTable
CREATE TABLE "public"."CompanyConsent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "grantedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyConsent_companyId_consentType_idx" ON "public"."CompanyConsent"("companyId", "consentType");

-- AddForeignKey
ALTER TABLE "public"."CompanyConsent" ADD CONSTRAINT "CompanyConsent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
