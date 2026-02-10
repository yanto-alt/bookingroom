-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DROP_OFF', 'STANDBY');

-- AlterTable
ALTER TABLE "VehicleBooking" ADD COLUMN     "serviceType" "ServiceType" NOT NULL DEFAULT 'STANDBY';
ALTER TABLE "VehicleBooking" ALTER COLUMN "driverRequired" SET DEFAULT true;
