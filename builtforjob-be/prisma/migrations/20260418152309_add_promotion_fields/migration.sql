-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "isSponsored" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotedUntil" TIMESTAMP(3);
