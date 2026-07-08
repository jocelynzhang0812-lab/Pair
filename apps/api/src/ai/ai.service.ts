import { Injectable } from '@nestjs/common';

import { A2A_MESSAGE_MAX_CHARS } from './ai.constants';
import { LlmService } from './llm.service';
import {
  DIALOGUE_SYSTEM_PROMPT,
  MATCH_SCORE_SYSTEM_PROMPT,
  PROFILE_DRAFT_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT,
  buildDialogueUserPrompt,
  buildMatchScoreUserPrompt,
  buildProfileDraftUserPrompt,
  buildSummaryUserPrompt,
} from './prompts';

type SocialLinkType = 'linkedin' | 'xiaohongshu' | 'website' | 'other';

export interface ProfileDraftOutput {
  displayName: string;
  title: string;
  companyOrSchool: string;
  bio: string;
  supertags: string[];
  socialLinks: Array<{ type: SocialLinkType; url: string }>;
  strengths: string[];
  interests: string[];
  confidence: number;
}

export interface MatchScoreOutput {
  /** 0-100, higher is a stronger match. */
  score: number;
  reason: string;
}

export interface DialogueTurnOutput {
  content: string;
}

export interface SummaryOutput {
  yourViewOfThem: string;
  theirViewOfYou: string;
  topics: string[];
  /** 1-10, higher is more worth meeting. */
  alignmentScore: number;
  scoreReason: string;
  riskNote: string;
}

export interface ProfileSnapshotInput {
  name: string;
  headline?: string | null;
  bio?: string | null;
  tags?: string[];
}

export interface TranscriptLineInput {
  speaker: string;
  content: string;
}

/**
 * AI agents for Pair. Each public method tries the real LLM first and falls
 * back to a deterministic mock when the LLM is disabled (no OPENAI_API_KEY) or
 * returns invalid output, so local dev and `verify:flow` stay fully offline.
 */
@Injectable()
export class AiService {
  constructor(private readonly llm: LlmService) {}

  async generateProfileDraft(input: {
    sourceUrl?: string;
    pastedText?: string;
    locale?: string;
  }): Promise<ProfileDraftOutput> {
    const draft = await this.llm.chatJson<ProfileDraftOutput>({
      model: 'mini',
      system: PROFILE_DRAFT_SYSTEM_PROMPT,
      user: buildProfileDraftUserPrompt(input),
      validate: (raw) => this.validateProfileDraft(raw),
    });

    return draft ?? this.mockProfileDraft(input);
  }

  async scoreMatch(input: {
    objectiveKind: string;
    viewer: ProfileSnapshotInput;
    candidate: ProfileSnapshotInput;
  }): Promise<MatchScoreOutput> {
    const result = await this.llm.chatJson<MatchScoreOutput>({
      model: 'mini',
      system: MATCH_SCORE_SYSTEM_PROMPT,
      user: buildMatchScoreUserPrompt(input),
      validate: (raw) => this.validateMatchScore(raw),
    });

    return result ?? this.mockMatchScore(input);
  }

  async generateDialogueTurn(input: {
    objectiveKind: string;
    speaker: ProfileSnapshotInput;
    counterpart: ProfileSnapshotInput;
    round: number;
    totalRounds: number;
    history: TranscriptLineInput[];
  }): Promise<DialogueTurnOutput> {
    const result = await this.llm.chatJson<DialogueTurnOutput>({
      model: 'dialogue',
      system: DIALOGUE_SYSTEM_PROMPT,
      user: buildDialogueUserPrompt(input),
      temperature: 0.8,
      maxTokens: 300,
      validate: (raw) => this.validateDialogueTurn(raw),
    });

    return result ?? this.mockDialogueTurn(input);
  }

  async generateSummary(input: {
    objectiveKind: string;
    matchReason: string;
    matchScore: number;
    viewer: ProfileSnapshotInput;
    candidate: ProfileSnapshotInput;
    transcript: TranscriptLineInput[];
  }): Promise<SummaryOutput> {
    const result = await this.llm.chatJson<SummaryOutput>({
      model: 'dialogue',
      system: SUMMARY_SYSTEM_PROMPT,
      user: buildSummaryUserPrompt(input),
      validate: (raw) => this.validateSummary(raw),
    });

    return result ?? this.mockSummary(input);
  }

  // -------------------------------------------------------------------------
  // Validators (normalize LLM JSON; return null to reject and fall back)
  // -------------------------------------------------------------------------

  private validateProfileDraft(raw: unknown): ProfileDraftOutput | null {
    const obj = asRecord(raw);
    if (!obj) {
      return null;
    }

    const displayName = asString(obj.displayName);
    const title = asString(obj.title);
    if (!displayName || !title) {
      return null;
    }

    return {
      displayName,
      title,
      companyOrSchool: asString(obj.companyOrSchool) ?? 'Independent',
      bio: (asString(obj.bio) ?? '').slice(0, 240),
      supertags: asStringArray(obj.supertags).slice(0, 4),
      socialLinks: this.normalizeSocialLinks(obj.socialLinks),
      strengths: asStringArray(obj.strengths).slice(0, 3),
      interests: asStringArray(obj.interests).slice(0, 3),
      confidence: clampNumber(obj.confidence, 0, 1) ?? 0.7,
    };
  }

  private validateMatchScore(raw: unknown): MatchScoreOutput | null {
    const obj = asRecord(raw);
    if (!obj) {
      return null;
    }

    const score = clampNumber(obj.score, 0, 100);
    const reason = asString(obj.reason);
    if (score === null || !reason) {
      return null;
    }

    return { score: Math.round(score), reason };
  }

  private validateDialogueTurn(raw: unknown): DialogueTurnOutput | null {
    const obj = asRecord(raw);
    if (!obj) {
      return null;
    }

    const content = asString(obj.content);
    if (!content) {
      return null;
    }

    return { content: content.slice(0, A2A_MESSAGE_MAX_CHARS) };
  }

  private validateSummary(raw: unknown): SummaryOutput | null {
    const obj = asRecord(raw);
    if (!obj) {
      return null;
    }

    const yourViewOfThem = asString(obj.yourViewOfThem);
    const theirViewOfYou = asString(obj.theirViewOfYou);
    if (!yourViewOfThem || !theirViewOfYou) {
      return null;
    }

    return {
      yourViewOfThem,
      theirViewOfYou,
      topics: asStringArray(obj.topics).slice(0, 4),
      alignmentScore: Math.round(clampNumber(obj.alignmentScore, 1, 10) ?? 6),
      scoreReason: asString(obj.scoreReason) ?? '',
      riskNote: asString(obj.riskNote) ?? '',
    };
  }

  private normalizeSocialLinks(raw: unknown): Array<{ type: SocialLinkType; url: string }> {
    if (!Array.isArray(raw)) {
      return [];
    }

    const types: SocialLinkType[] = ['linkedin', 'xiaohongshu', 'website', 'other'];
    return raw
      .map((item) => asRecord(item))
      .filter((item): item is Record<string, unknown> => item !== null)
      .map((item) => {
        const url = asString(item.url);
        if (!url) {
          return null;
        }
        const rawType = asString(item.type);
        const type = types.includes(rawType as SocialLinkType)
          ? (rawType as SocialLinkType)
          : this.platformFromUrl(url);
        return { type, url };
      })
      .filter((item): item is { type: SocialLinkType; url: string } => item !== null);
  }

  // -------------------------------------------------------------------------
  // Deterministic mocks (offline fallback)
  // -------------------------------------------------------------------------

  private mockProfileDraft(input: {
    sourceUrl?: string;
    pastedText?: string;
    locale?: string;
  }): ProfileDraftOutput {
    const text = input.pastedText?.trim() || '';
    const url = input.sourceUrl?.trim();
    const name = this.extractName(text) ?? 'Pair User';
    const title = this.extractTitle(text) ?? 'AI product builder';
    const companyOrSchool = this.extractCompany(title) ?? 'Independent';
    const tags = this.tagsFromText(`${text} ${url ?? ''}`);

    return {
      displayName: name,
      title,
      companyOrSchool,
      bio: text
        ? this.compactBio(text)
        : '关注 AI 产品、Agent 工作流和高质量职业连接，正在寻找互补的交流对象。',
      supertags: tags,
      socialLinks: url
        ? [
            {
              type: this.platformFromUrl(url),
              url,
            },
          ]
        : [],
      strengths: this.strengthsFromTags(tags),
      interests: ['early-stage AI', 'agent UX', 'structured networking'],
      confidence: text || url ? 0.82 : 0.62,
    };
  }

  private mockMatchScore(input: {
    objectiveKind: string;
    viewer: ProfileSnapshotInput;
    candidate: ProfileSnapshotInput;
  }): MatchScoreOutput {
    const viewerTags = new Set((input.viewer.tags ?? []).map((tag) => tag.toLowerCase()));
    const shared = (input.candidate.tags ?? []).filter((tag) => viewerTags.has(tag.toLowerCase()));
    const score = Math.max(0, Math.min(100, 60 + shared.length * 8));
    const reason = shared.length
      ? `Shared focus on ${shared.slice(0, 2).join(', ')} with complementary experience for ${input.objectiveKind}.`
      : `Complementary backgrounds that could be productive for ${input.objectiveKind}.`;

    return { score, reason };
  }

  private mockDialogueTurn(input: {
    speaker: ProfileSnapshotInput;
    round: number;
  }): DialogueTurnOutput {
    const lines = [
      'The strongest overlap is AI product judgment and early-stage exploration.',
      'The complementary angle is practical product execution paired with deeper technical context.',
      'Useful first topics are Agent UX, team fit, and whether both sides want a fast exploratory chat.',
      'Risk is mostly timing and scope; the conversation should stay focused on one concrete path.',
      'There is genuine mutual value if both sides stay on a single collaboration question.',
    ];
    const line = lines[(Math.max(1, input.round) - 1) % lines.length];

    return {
      content: `${input.speaker.name}'s Agent: ${line}`.slice(0, A2A_MESSAGE_MAX_CHARS),
    };
  }

  private mockSummary(input: {
    matchReason: string;
    matchScore: number;
    viewer: ProfileSnapshotInput;
    candidate: ProfileSnapshotInput;
  }): SummaryOutput {
    const candidateName = input.candidate.name;
    const viewerName = input.viewer.name;

    return {
      yourViewOfThem: `${candidateName} looks relevant because their recent work overlaps with your direction while adding a different operating lens.`,
      theirViewOfYou: `${viewerName} appears useful as a high-context collaborator with clear interest in validating early opportunities.`,
      topics: ['Agent product UX', 'early-stage validation', 'collaboration fit'],
      alignmentScore: Math.max(1, Math.min(10, Math.round(input.matchScore / 10) || 6)),
      scoreReason: input.matchReason,
      riskNote: 'Keep the first call narrow so the match does not become a broad networking chat.',
    };
  }

  // -------------------------------------------------------------------------
  // Profile mock helpers
  // -------------------------------------------------------------------------

  private extractName(text: string): string | null {
    const match = text.match(/(?:name|姓名)[:：]\s*([^\n,，]+)/i);
    return match?.[1]?.trim() ?? null;
  }

  private extractTitle(text: string): string | null {
    const match = text.match(/(?:title|headline|职位|身份)[:：]\s*([^\n]+)/i);
    return match?.[1]?.trim() ?? null;
  }

  private extractCompany(title: string): string | null {
    const match = title.match(/(?:at|@)\s*([^·,\n]+)/i);
    return match?.[1]?.trim() ?? null;
  }

  private compactBio(text: string): string {
    return text.replace(/\s+/g, ' ').slice(0, 240);
  }

  private tagsFromText(text: string): string[] {
    const lower = text.toLowerCase();
    const tags = new Set<string>();

    if (lower.includes('ai') || lower.includes('agent')) {
      tags.add('ai-pm');
    }
    if (lower.includes('growth') || lower.includes('增长')) {
      tags.add('growth');
    }
    if (lower.includes('founder') || lower.includes('创业')) {
      tags.add('founder');
    }
    if (lower.includes('design') || lower.includes('设计')) {
      tags.add('design-engineering');
    }
    if (lower.includes('research') || lower.includes('研究')) {
      tags.add('ai-research');
    }

    return [...tags].slice(0, 4).concat(tags.size ? [] : ['ai-product']);
  }

  private strengthsFromTags(tags: string[]): string[] {
    const strengthsByTag: Record<string, string> = {
      'ai-pm': 'AI product judgment',
      growth: 'go-to-market',
      founder: 'early-stage validation',
      'design-engineering': 'prototype craft',
      'ai-research': 'technical depth',
      'ai-product': 'product clarity',
    };

    return tags.map((tag) => strengthsByTag[tag] ?? tag).slice(0, 3);
  }

  private platformFromUrl(url: string): SocialLinkType {
    if (url.includes('linkedin.com')) {
      return 'linkedin';
    }
    if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
      return 'xiaohongshu';
    }
    if (url.startsWith('http')) {
      return 'website';
    }

    return 'other';
  }
}

// ---------------------------------------------------------------------------
// Local parsing helpers
// ---------------------------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function clampNumber(value: unknown, min: number, max: number): number | null {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  return Math.max(min, Math.min(max, num));
}
