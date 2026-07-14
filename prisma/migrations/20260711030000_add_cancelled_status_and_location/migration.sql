-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "technician_profiles" ADD COLUMN "location" TEXT;
