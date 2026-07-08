/**
 * Versioned prompt templates for Pair's AI agents.
 *
 * Keep all prompts here (not inline in services) so they can be reviewed and
 * evolved via git. Each agent has a system prompt plus a typed user-prompt
 * builder. All agents must return strict JSON; services validate the shape and
 * fall back to a deterministic mock when the LLM is disabled or invalid.
 */

import { A2A_MESSAGE_MAX_CHARS } from './ai.constants';

interface ProfileSnapshot {
  name: string;
  headline?: string | null;
  bio?: string | null;
  tags?: string[];
}

interface TranscriptLine {
  speaker: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Profile Agent
// ---------------------------------------------------------------------------

export const PROFILE_DRAFT_SYSTEM_PROMPT = `You are Pair's Profile Agent. You read a person's public professional material and produce a concise, high-signal networking profile.

Return ONLY a JSON object with exactly these keys:
- displayName: string
- title: string (role / headline)
- companyOrSchool: string
- bio: string, at most 240 characters, first person, warm but professional
- supertags: array of 2-4 short lowercase-hyphen slugs (e.g. "ai-pm", "growth", "founder")
- socialLinks: array of objects { "type": "linkedin" | "xiaohongshu" | "website" | "other", "url": string }
- strengths: array of up to 3 short phrases
- interests: array of up to 3 short phrases
- confidence: number between 0 and 1

Rules:
- Write bio, strengths, and interests in the same language as the input (Chinese if the input is Chinese).
- Never invent contact details, employers, or achievements that are not supported by the input.
- If information is missing, keep fields short and lower the confidence.`;

export function buildProfileDraftUserPrompt(input: {
  sourceUrl?: string;
  pastedText?: string;
  locale?: string;
}): string {
  return [
    input.locale ? `Preferred output language: ${input.locale}` : '',
    input.sourceUrl ? `Source URL: ${input.sourceUrl}` : '',
    input.pastedText ? `Pasted profile text:\n${input.pastedText.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// Match Agent
// ---------------------------------------------------------------------------

export const MATCH_SCORE_SYSTEM_PROMPT = `You are Pair's Match Agent. You judge how promising a professional connection is between a viewer and a candidate for a specific objective.

Return ONLY a JSON object with exactly these keys:
- score: integer from 0 to 100 (higher means a stronger, more actionable match)
- reason: string, one or two sentences explaining the strongest overlap and the complementary angle

Rules:
- Reward complementary strengths and shared direction; penalize vague or purely overlapping profiles.
- Write the reason in the same language as the profiles (Chinese if they are Chinese).
- Be specific and grounded in the provided profiles; do not invent facts.`;

export function buildMatchScoreUserPrompt(input: {
  objectiveKind: string;
  viewer: ProfileSnapshot;
  candidate: ProfileSnapshot;
}): string {
  return [
    `Objective: ${input.objectiveKind}`,
    `Viewer: ${renderSnapshot(input.viewer)}`,
    `Candidate: ${renderSnapshot(input.candidate)}`,
  ].join('\n\n');
}

// ---------------------------------------------------------------------------
// Dialogue Agent
// ---------------------------------------------------------------------------

export const DIALOGUE_SYSTEM_PROMPT = `You are an AI Agent representing one professional while it talks to another professional's AI Agent. The goal is a short, structured conversation that surfaces real fit before the humans decide to meet.

Return ONLY a JSON object with exactly this key:
- content: string, at most ${A2A_MESSAGE_MAX_CHARS} characters, a single conversational turn spoken by your side's Agent

Rules:
- Speak as "<name>'s Agent" in the third person about the humans (e.g. "The strongest overlap is ...").
- Advance the conversation: probe fit, propose concrete first topics, or surface a real risk. Do not repeat previous turns.
- Never reveal or ask for contact details, phone numbers, emails, or exact locations.
- Write in the same language as the profiles (Chinese if they are Chinese).`;

export function buildDialogueUserPrompt(input: {
  objectiveKind: string;
  speaker: ProfileSnapshot;
  counterpart: ProfileSnapshot;
  round: number;
  totalRounds: number;
  history: TranscriptLine[];
}): string {
  const history = input.history.length
    ? input.history.map((line) => `${line.speaker}: ${line.content}`).join('\n')
    : '(no messages yet — you open the conversation)';

  return [
    `Objective: ${input.objectiveKind}`,
    `You represent: ${renderSnapshot(input.speaker)}`,
    `Counterpart: ${renderSnapshot(input.counterpart)}`,
    `Turn ${input.round} of ${input.totalRounds} total turns.`,
    `Conversation so far:\n${history}`,
    `Write the next single turn for ${input.speaker.name}'s Agent.`,
  ].join('\n\n');
}

// ---------------------------------------------------------------------------
// Summary Agent
// ---------------------------------------------------------------------------

export const SUMMARY_SYSTEM_PROMPT = `You are Pair's Summary Agent. After two Agents finish a conversation, you produce a decision-support summary for the viewer.

Return ONLY a JSON object with exactly these keys:
- yourViewOfThem: string (why the candidate is relevant to the viewer)
- theirViewOfYou: string (how the viewer likely looks useful to the candidate)
- topics: array of 2-4 short suggested first-meeting topics
- alignmentScore: integer from 1 to 10 (higher means more worth meeting)
- scoreReason: string, one sentence justifying the score
- riskNote: string (one concrete risk or caveat to keep the first meeting focused)

Rules:
- Ground everything in the transcript and profiles; do not invent facts.
- Write in the same language as the profiles (Chinese if they are Chinese).`;

export function buildSummaryUserPrompt(input: {
  objectiveKind: string;
  matchReason: string;
  viewer: ProfileSnapshot;
  candidate: ProfileSnapshot;
  transcript: TranscriptLine[];
}): string {
  const transcript = input.transcript.length
    ? input.transcript.map((line) => `${line.speaker}: ${line.content}`).join('\n')
    : '(empty conversation)';

  return [
    `Objective: ${input.objectiveKind}`,
    `Match reason: ${input.matchReason}`,
    `Viewer: ${renderSnapshot(input.viewer)}`,
    `Candidate: ${renderSnapshot(input.candidate)}`,
    `Transcript:\n${transcript}`,
  ].join('\n\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderSnapshot(snapshot: ProfileSnapshot): string {
  const parts = [
    snapshot.name,
    snapshot.headline ? `— ${snapshot.headline}` : '',
    snapshot.tags?.length ? `[${snapshot.tags.join(', ')}]` : '',
    snapshot.bio ? `\nBio: ${snapshot.bio}` : '',
  ].filter(Boolean);

  return parts.join(' ').trim();
}
