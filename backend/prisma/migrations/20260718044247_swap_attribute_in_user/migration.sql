/*
  Warnings:

  - You are about to drop the column `currentDataSize` on the `sheet` table. All the data in the column will be lost.
  - Added the required column `range` to the `sheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sheet" DROP COLUMN "currentDataSize",
ADD COLUMN     "range" TEXT NOT NULL;
