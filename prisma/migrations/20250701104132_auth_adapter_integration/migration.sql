/*
  Warnings:

  - You are about to drop the column `is_active` on the `listings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'RESERVED', 'SOLD');

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "is_active",
ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE';
