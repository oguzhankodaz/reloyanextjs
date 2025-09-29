-- AlterTable
ALTER TABLE "public"."PointsUsage" ADD COLUMN     "createdByStaffId" TEXT;

-- AlterTable
ALTER TABLE "public"."Purchase" ADD COLUMN     "createdByStaffId" TEXT;

-- CreateTable
CREATE TABLE "public"."CompanyStaff" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyStaff_email_key" ON "public"."CompanyStaff"("email");

-- AddForeignKey
ALTER TABLE "public"."CompanyStaff" ADD CONSTRAINT "CompanyStaff_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Purchase" ADD CONSTRAINT "Purchase_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "public"."CompanyStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PointsUsage" ADD CONSTRAINT "PointsUsage_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "public"."CompanyStaff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
