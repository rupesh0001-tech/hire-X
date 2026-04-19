/*
  Warnings:

  - A unique constraint covering the columns `[shortId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'WITHDRAWN';
ALTER TYPE "ApplicationStatus" ADD VALUE 'TERMINATED';

-- AlterTable
ALTER TABLE "marketplace_listings" ADD COLUMN     "concernsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "shortId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_shortId_key" ON "users"("shortId");
