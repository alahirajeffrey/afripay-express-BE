/*
  Warnings:

  - You are about to drop the column `username` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[afripayTag]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `afripayTag` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- DropIndex
DROP INDEX "Account_username_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "username",
ADD COLUMN     "afripayTag" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "loginPin" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_afripayTag_key" ON "Account"("afripayTag");
