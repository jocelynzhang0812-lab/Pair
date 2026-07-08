-- CreateEnum
CREATE TYPE "ObjectiveKind" AS ENUM ('startup', 'mentor', 'cross_industry', 'cofound');

-- CreateEnum
CREATE TYPE "ObjectiveSide" AS ENUM ('a', 'b');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('pending', 'a_accepted', 'b_accepted', 'both_accepted', 'dialogue_running', 'dialogue_done', 'scheduled', 'done', 'rejected');

-- CreateEnum
CREATE TYPE "IntroVariant" AS ENUM ('professional', 'casual', 'story');

-- CreateEnum
CREATE TYPE "A2ASessionState" AS ENUM ('pending', 'running', 'completed', 'aborted', 'failed');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('scheduled', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('linkedin', 'xiaohongshu', 'website', 'other');

-- CreateTable
CREATE TABLE "objectives" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "ObjectiveKind" NOT NULL,
    "side" "ObjectiveSide" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_a_id" UUID NOT NULL,
    "user_b_id" UUID NOT NULL,
    "objective_kind" "ObjectiveKind" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "state" "MatchStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intros" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "variant" "IntroVariant" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "intros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "state" "A2ASessionState" NOT NULL DEFAULT 'pending',
    "total_rounds" INTEGER NOT NULL DEFAULT 5,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogue_messages" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "round" INTEGER NOT NULL,
    "speaker_agent_user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "redacted_spans" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "dialogue_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summaries" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "your_view_of_them" TEXT NOT NULL,
    "their_view_of_you" TEXT NOT NULL,
    "topics" TEXT[],
    "alignment_score" INTEGER NOT NULL,
    "score_reason" TEXT NOT NULL,
    "risk_note" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "meeting_url" TEXT NOT NULL,
    "state" "MeetingStatus" NOT NULL DEFAULT 'scheduled',

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" UUID NOT NULL,
    "meeting_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "tags" TEXT[],
    "comment" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_pages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "og_image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "objectives_user_id_idx" ON "objectives"("user_id");

-- CreateIndex
CREATE INDEX "social_links_user_id_idx" ON "social_links"("user_id");

-- CreateIndex
CREATE INDEX "matches_user_a_id_idx" ON "matches"("user_a_id");

-- CreateIndex
CREATE INDEX "matches_user_b_id_idx" ON "matches"("user_b_id");

-- CreateIndex
CREATE INDEX "matches_state_idx" ON "matches"("state");

-- CreateIndex
CREATE INDEX "intros_match_id_idx" ON "intros"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "dialogues_match_id_key" ON "dialogues"("match_id");

-- CreateIndex
CREATE INDEX "dialogue_messages_session_id_idx" ON "dialogue_messages"("session_id");

-- CreateIndex
CREATE INDEX "dialogue_messages_session_id_round_idx" ON "dialogue_messages"("session_id", "round");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_session_id_key" ON "summaries"("session_id");

-- CreateIndex
CREATE INDEX "meetings_match_id_idx" ON "meetings"("match_id");

-- CreateIndex
CREATE INDEX "feedback_meeting_id_idx" ON "feedback"("meeting_id");

-- CreateIndex
CREATE INDEX "feedback_user_id_idx" ON "feedback"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "public_pages_user_id_key" ON "public_pages"("user_id");

-- AddForeignKey
ALTER TABLE "objectives" ADD CONSTRAINT "objectives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_links" ADD CONSTRAINT "social_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intros" ADD CONSTRAINT "intros_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogue_messages" ADD CONSTRAINT "dialogue_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "dialogues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogue_messages" ADD CONSTRAINT "dialogue_messages_speaker_agent_user_id_fkey" FOREIGN KEY ("speaker_agent_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "dialogues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_pages" ADD CONSTRAINT "public_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
