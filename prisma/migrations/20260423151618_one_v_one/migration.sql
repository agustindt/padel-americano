-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerA2Id_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_playerB2Id_fkey";

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerA2Id_fkey" FOREIGN KEY ("playerA2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_playerB2Id_fkey" FOREIGN KEY ("playerB2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
