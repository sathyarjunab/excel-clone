-- CreateTable
CREATE TABLE "sheet" (
    "id" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "chunksCount" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sheet_userId_chunksCount_idx" ON "sheet"("userId", "chunksCount");

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- AddForeignKey
ALTER TABLE "sheet" ADD CONSTRAINT "sheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
