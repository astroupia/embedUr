-- CreateEnum
CREATE TYPE "public"."ReplySource" AS ENUM ('SMARTLEAD', 'MANUAL', 'WEBHOOK');

-- AlterTable
ALTER TABLE "public"."Reply" ADD COLUMN     "source" "public"."ReplySource" NOT NULL DEFAULT 'MANUAL';
