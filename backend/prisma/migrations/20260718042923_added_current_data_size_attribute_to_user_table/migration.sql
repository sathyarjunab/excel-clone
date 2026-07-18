/*
  Warnings:

  - Added the required column `currentDataSize` to the `sheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sheet" ADD COLUMN     "currentDataSize" INTEGER NOT NULL;
