-- AlterTable
ALTER TABLE "Match" ADD COLUMN "setScores" JSONB;

UPDATE "Match"
SET "setScores" = jsonb_build_array(
  jsonb_build_object('a', "scoreTeamA", 'b', "scoreTeamB")
)
WHERE "scoreTeamA" IS NOT NULL AND "scoreTeamB" IS NOT NULL;

ALTER TABLE "Match" DROP COLUMN "scoreTeamA";
ALTER TABLE "Match" DROP COLUMN "scoreTeamB";
