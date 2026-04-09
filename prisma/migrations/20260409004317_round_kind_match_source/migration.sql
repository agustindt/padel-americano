-- CreateEnum
CREATE TYPE "RoundKind" AS ENUM ('AMERICANO_RANDOM', 'MANUAL_SINGLE');

-- CreateEnum
CREATE TYPE "MatchSource" AS ENUM ('AUTO', 'MANUAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "source" "MatchSource" NOT NULL DEFAULT 'AUTO';

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "kind" "RoundKind" NOT NULL DEFAULT 'AMERICANO_RANDOM';
