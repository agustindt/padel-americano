-- AlterEnum: add 1v1 round kinds
ALTER TYPE "RoundKind" ADD VALUE 'ONE_V_ONE_RANDOM';
ALTER TYPE "RoundKind" ADD VALUE 'MANUAL_ONE_V_ONE';

-- 1v1: optional second slot per side (doubles use both)
ALTER TABLE "Match" ALTER COLUMN "playerA2Id" DROP NOT NULL;
ALTER TABLE "Match" ALTER COLUMN "playerB2Id" DROP NOT NULL;
