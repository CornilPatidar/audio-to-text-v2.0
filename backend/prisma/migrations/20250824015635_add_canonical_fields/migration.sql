-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "usernameCanonical" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailCanonical" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transcriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "durationSeconds" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "transcriptionOutput" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_usernameCanonical_key" ON "public"."users"("usernameCanonical");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailCanonical_key" ON "public"."users"("emailCanonical");

-- CreateIndex
CREATE INDEX "users_usernameCanonical_idx" ON "public"."users"("usernameCanonical");

-- CreateIndex
CREATE INDEX "users_emailCanonical_idx" ON "public"."users"("emailCanonical");

-- AddForeignKey
ALTER TABLE "public"."transcriptions" ADD CONSTRAINT "transcriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
