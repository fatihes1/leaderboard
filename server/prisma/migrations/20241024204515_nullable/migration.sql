-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_countryId_fkey";

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "countryId" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
