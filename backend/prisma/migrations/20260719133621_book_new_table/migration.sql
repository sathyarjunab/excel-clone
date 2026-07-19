/*
  Warnings:

  - Added the required column `bookId` to the `sheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sheet" ADD COLUMN     "bookId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "sheet" ADD CONSTRAINT "sheet_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
