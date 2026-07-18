/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_name_key";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_token_key" ON "user"("token");
