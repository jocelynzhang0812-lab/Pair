-- CreateEnum
CREATE TYPE "AiJobKind" AS ENUM ('profile_generate', 'match_generate', 'dialogue_run', 'summary_generate');

-- CreateEnum
CREATE TYPE "AiJobState" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "ProfileDraftState" AS ENUM ('draft', 'confirmed', 'discarded');

-- CreateTable
CREATE TABLE "ai_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "kind" "AiJobKind" NOT NULL,
    "state" "AiJobState" NOT NULL DEFAULT 'queued',
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error_code" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_drafts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "source_url" TEXT,
    "pasted_text" TEXT,
    "draft" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "state" "ProfileDraftState" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "profile_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_jobs_user_id_idx" ON "ai_jobs"("user_id");

-- CreateIndex
CREATE INDEX "ai_jobs_state_idx" ON "ai_jobs"("state");

-- CreateIndex
CREATE INDEX "ai_jobs_kind_idx" ON "ai_jobs"("kind");

-- CreateIndex
CREATE INDEX "profile_drafts_user_id_idx" ON "profile_drafts"("user_id");

-- CreateIndex
CREATE INDEX "profile_drafts_state_idx" ON "profile_drafts"("state");

-- AddForeignKey
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_drafts" ADD CONSTRAINT "profile_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
