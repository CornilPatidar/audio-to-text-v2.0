-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "isFirebaseUser" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
