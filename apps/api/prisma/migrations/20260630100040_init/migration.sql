-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'wechat', 'google');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "auth_provider" "AuthProvider" NOT NULL,
    "auth_provider_id" TEXT NOT NULL,
    "pair_profile_url" TEXT NOT NULL,
    "meeting_quota_per_week" INTEGER NOT NULL DEFAULT 3,
    "invite_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_pair_profile_url_key" ON "users"("pair_profile_url");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
