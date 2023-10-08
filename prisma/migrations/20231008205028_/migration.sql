/*
  Warnings:

  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `archetype` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `benchPressLb` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deadLiftLb` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `heightFoot` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `heightInch` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pictureUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registeredWith` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `squatLb` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weightLb` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `workoutPattern` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `yoe` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "registerType" AS ENUM ('LOCAL', 'GOOGLE', 'FACEBOOk', 'INSTAGRAM');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "age",
DROP COLUMN "archetype",
DROP COLUMN "benchPressLb",
DROP COLUMN "deadLiftLb",
DROP COLUMN "gender",
DROP COLUMN "heightFoot",
DROP COLUMN "heightInch",
DROP COLUMN "pictureUrl",
DROP COLUMN "registeredWith",
DROP COLUMN "squatLb",
DROP COLUMN "weightLb",
DROP COLUMN "workoutPattern",
DROP COLUMN "yoe",
ADD COLUMN     "type" "registerType" NOT NULL;

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "age" INTEGER,
    "gender" "Gender",
    "weightLb" INTEGER,
    "heightFoot" INTEGER,
    "heightInch" INTEGER,
    "squatLb" INTEGER,
    "deadLiftLb" INTEGER,
    "benchPressLb" INTEGER,
    "workoutPattern" JSONB,
    "archetype" "Archetype",
    "yoe" INTEGER,
    "pictureUrl" TEXT,
    "bio" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
