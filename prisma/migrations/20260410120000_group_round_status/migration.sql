-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PLAYED');

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Group" ("id", "name") VALUES ('grp_default_pad', 'Grupo');

-- AlterTable User: nullable first, backfill, then NOT NULL
ALTER TABLE "User" ADD COLUMN "groupId" TEXT;
UPDATE "User" SET "groupId" = 'grp_default_pad' WHERE "groupId" IS NULL;
ALTER TABLE "User" ALTER COLUMN "groupId" SET NOT NULL;

-- AlterTable Round
ALTER TABLE "Round" ADD COLUMN "status" "RoundStatus" NOT NULL DEFAULT 'CONFIRMED';
ALTER TABLE "Round" ADD COLUMN "groupId" TEXT;
UPDATE "Round" SET "groupId" = 'grp_default_pad' WHERE "groupId" IS NULL;
ALTER TABLE "Round" ALTER COLUMN "groupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Round" ADD CONSTRAINT "Round_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
