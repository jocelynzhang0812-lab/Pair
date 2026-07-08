import type { A2AMessage, A2ASummary, Objective, Profile } from '@pair/shared';

import type { MatchCardView } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_PAIR_API_BASE_URL ?? 'http://127.0.0.1:4000';
const TOKEN_KEY = 'pair.accessToken';

interface ApiEnvelope<T> {
  data: T;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    pairProfileUrl: string;
    hasProfile: boolean;
  };
}

interface BackendProfile {
  name: string;
  headline: string;
  avatarUrl?: string | null;
  bio: string;
  tags: string[];
}

interface BackendSocialLink {
  platform: 'linkedin' | 'xiaohongshu' | 'website' | 'other';
  url: string;
}

interface BackendObjective {
  kind: Objective['kind'];
  side: Objective['side'];
}

interface BackendMatch {
  id: string;
  score: number;
  reason: string;
  state: string;
  candidate: {
    id: string;
    pairProfileUrl: string;
    profile: BackendProfile | null;
    objectives: BackendObjective[];
    socialLinks: BackendSocialLink[];
  };
  invitation: {
    text: string;
  } | null;
  session: {
    id: string;
    state: string;
    summaryId: string | null;
  } | null;
}

export interface SendMatchResponse {
  matchId: string;
  state: string;
  sessionId: string;
  summaryId?: string | null;
}

export interface A2AView {
  id: string;
  matchId: string;
  state: string;
  totalRounds: number;
  completedRounds: number;
  candidate: {
    profile: BackendProfile | null;
  };
  messages: Array<
    A2AMessage & {
      speaker?: BackendProfile | null;
    }
  >;
  summaryId: string | null;
}

export interface PublicProfileView {
  slug: string;
  profile: BackendProfile | null;
  objectives: BackendObjective[];
  socialLinks: BackendSocialLink[];
}

export interface ProfileGenerationResponse {
  jobId: string;
  state: string;
  draftId: string;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export async function mockLogin(): Promise<LoginResponse> {
  const login = await request<LoginResponse>('/auth/mock-login', {
    method: 'POST',
    body: JSON.stringify({
      provider: 'email',
      providerId: 'web-demo@pair.local',
      name: '章璟菲',
    }),
  });
  storeToken(login.accessToken);
  return login;
}

export async function ensureToken(): Promise<string> {
  const existing = getStoredToken();
  if (existing) {
    return existing;
  }

  const login = await mockLogin();
  return login.accessToken;
}

export async function generateProfileDraft(input: {
  sourceUrl?: string;
  pastedText?: string;
  locale?: string;
}): Promise<ProfileGenerationResponse> {
  return request<ProfileGenerationResponse>('/profiles/generate', {
    method: 'POST',
    token: await ensureToken(),
    body: JSON.stringify(input),
  });
}

export async function confirmProfileDraft(draftId: string): Promise<unknown> {
  return request('/profiles/confirm-draft', {
    method: 'POST',
    token: await ensureToken(),
    body: JSON.stringify({ draftId }),
  });
}

export async function replaceObjectives(objectives: Objective[]): Promise<unknown> {
  return request('/objectives', {
    method: 'PUT',
    token: await ensureToken(),
    body: JSON.stringify({ objectives }),
  });
}

export async function getMatches(): Promise<MatchCardView[]> {
  const matches = await request<BackendMatch[]>('/matches', {
    token: await ensureToken(),
  });

  return matches.map(toMatchCardView);
}

export async function passMatch(matchId: string): Promise<void> {
  await request(`/matches/${matchId}/pass`, {
    method: 'POST',
    token: await ensureToken(),
  });
}

export async function rewriteIntro(matchId: string): Promise<void> {
  await request(`/matches/${matchId}/rewrite-intro`, {
    method: 'POST',
    token: await ensureToken(),
    body: JSON.stringify({ variant: 'casual' }),
  });
}

export async function sendMatch(matchId: string): Promise<SendMatchResponse> {
  return request<SendMatchResponse>(`/matches/${matchId}/send`, {
    method: 'POST',
    token: await ensureToken(),
  });
}

export async function getA2ASession(sessionId: string): Promise<A2AView> {
  return request<A2AView>(`/a2a/${sessionId}`, {
    token: await ensureToken(),
  });
}

export async function abortA2ASession(sessionId: string): Promise<void> {
  await request(`/a2a/${sessionId}/abort`, {
    method: 'POST',
    token: await ensureToken(),
  });
}

export async function getSummary(summaryId: string): Promise<A2ASummary> {
  return request<A2ASummary>(`/summaries/${summaryId}`, {
    token: await ensureToken(),
  });
}

export async function getPublicProfile(slug: string): Promise<PublicProfileView> {
  return request<PublicProfileView>(`/u/${slug}`);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });
  const body = (await response.json()) as ApiEnvelope<T> | { message?: string };

  if (!response.ok || !('data' in body)) {
    throw new Error('message' in body && body.message ? body.message : `${path} failed`);
  }

  return body.data;
}

function toMatchCardView(match: BackendMatch): MatchCardView {
  const profile = toProfile(match.candidate.profile, match.candidate.socialLinks);
  const topics = [
    ...profile.tags.slice(0, 2),
    ...match.candidate.objectives.map((objective) => objective.kind),
  ].slice(0, 3);

  return {
    id: match.id,
    score: match.score,
    expiresInHours: 32,
    candidate: profile,
    whyMatch: match.reason,
    activeIntro: match.invitation?.text ?? '我想让 Agent 先替我们对齐一下。',
    topics: topics.length ? topics : ['AI product', 'Agent UX', '职业路径'],
    session: match.session,
  };
}

function toProfile(profile: BackendProfile | null, socialLinks: BackendSocialLink[] = []): Profile {
  return {
    name: profile?.name ?? 'Pair User',
    headline: profile?.headline ?? 'Pair member',
    avatarUrl: profile?.avatarUrl ?? undefined,
    bio: profile?.bio ?? '这个用户正在使用 Pair 探索高质量职业连接。',
    tags: profile?.tags?.length ? profile.tags : ['pair'],
    sourceLinks: socialLinks,
  };
}
