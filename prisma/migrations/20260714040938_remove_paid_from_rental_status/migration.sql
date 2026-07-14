/*
  Warnings:

  - The values [COMPLETED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAID] on the enum `RentalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED');
ALTER TABLE "public"."payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RentalStatus_new" AS ENUM ('PLACED', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED');
ALTER TABLE "public"."rental_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rental_orders" ALTER COLUMN "status" TYPE "RentalStatus_new" USING ("status"::text::"RentalStatus_new");
ALTER TYPE "RentalStatus" RENAME TO "RentalStatus_old";
ALTER TYPE "RentalStatus_new" RENAME TO "RentalStatus";
DROP TYPE "public"."RentalStatus_old";
ALTER TABLE "rental_orders" ALTER COLUMN "status" SET DEFAULT 'PLACED';
COMMIT;
