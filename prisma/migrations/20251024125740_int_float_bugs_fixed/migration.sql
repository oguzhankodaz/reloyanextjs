-- AlterTable
ALTER TABLE "public"."PointsUsage" ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."UserPoints" ALTER COLUMN "totalPoints" SET DEFAULT 0,
ALTER COLUMN "totalPoints" SET DATA TYPE DOUBLE PRECISION;
