-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'DEUTSCH', 'PORTUGUESE', 'FRENCH', 'SUOMI', 'NORSK', 'NEDERLANDS', 'CATALAN', 'TURKISH', 'CASTELLANO', 'ITALIANO', 'DANSK', 'CZECH', 'RUSSIAN', 'ESTONIAN', 'SERBIAN', 'GREEK', 'POLSKI', 'CROATIAN', 'HUNGARIAN', 'BRAZILIAN', 'SWEDISH', 'SLOVAK', 'GALEGO', 'SLOVENSKI', 'BELARUSSIAN', 'LATVIAN', 'LITHUANIAN', 'TRADITIONAL_CHINESE', 'SIMPLIFIED_CHINESE', 'JAPANESE', 'KOREAN', 'BULGARIAN', 'LATINO', 'UKRAINIAN', 'INDONESIAN', 'ROMANIAN');

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "skinId" TEXT,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cash" INTEGER NOT NULL DEFAULT 0,
    "bankCash" INTEGER NOT NULL DEFAULT 0,
    "health" INTEGER NOT NULL DEFAULT 100,
    "username" TEXT NOT NULL,
    "lastIPAddress" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_name_key" ON "Car"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "_CarToUser_AB_unique" ON "_CarToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CarToUser_B_index" ON "_CarToUser"("B");

-- AddForeignKey
ALTER TABLE "_CarToUser" ADD CONSTRAINT "_CarToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarToUser" ADD CONSTRAINT "_CarToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
