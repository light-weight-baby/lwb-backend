/*
  Warnings:

  - You are about to drop the column `partners` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "partners";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "_Partner" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Partner_AB_unique" ON "_Partner"("A", "B");

-- CreateIndex
CREATE INDEX "_Partner_B_index" ON "_Partner"("B");

-- AddForeignKey
ALTER TABLE "_Partner" ADD CONSTRAINT "_Partner_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Partner" ADD CONSTRAINT "_Partner_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
