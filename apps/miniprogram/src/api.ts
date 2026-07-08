/**
 * Mini Program API layer.
 *
 * Every page reads and writes product data through this module, so switching
 * between offline mock and the real `@pair/api` backend is a single flag in
 * `src/config.ts` (`USE_MOCK`) and the page flow stays identical.
 *
 * In mock mode the A2A session is simulated on a real clock: messages are
 * revealed one polling interval at a time, which lets the A2A page exercise
 * genuine polling/cleanup logic without a backend.
 *
 * In real mode the backend response shapes differ from the Mini Program view
 * types, so this module maps them (see memory-bank/backend-integration-plan.md
 * §1). Pages keep consuming the view types below unchanged.
 */
import { A2A_POLL_INTERVAL_MS, A2A_ROUNDS_PER_SIDE, A2A_TOTAL_MESSAGES, USE_MOCK } from './config';
import {
  DialogueMessageView,
  MatchView,
  PersonView,
  dialogueMessages,
  summary,
  todayMatches,
  viewerProfile,
} from './mock-data';
import { ApiError, request, setToken } from './request';

export type A2ASessionStatus = 'running' | 'completed' | 'aborted' | 'failed';

export interface A2ASummaryView {
  score: number;
  oneLine: string;
  topics: string[];
  risk?: string;
  yourView?: string;
  theirView?: string;
}

export interface A2ASessionView {
  sessionId: string;
  status: A2ASessionStatus;
  currentRound: number;
  totalRounds: number;
  /** 0-100 completion percentage for the progress bar. */
  progress: number;
  /** Rough seconds remaining until the dialogue completes. */
  estimatedSeconds: number;
  messages: DialogueMessageView[];
  summary?: A2ASummaryView;
}

// ---------------------------------------------------------------------------
// Real backend response shapes (subset of fields the client consumes)
// ---------------------------------------------------------------------------

interface RawProfile {
  name: string;
  headline: string;
  avatarUrl: string | null;
  bio: string;
  tags: string[];
}

interface RawCandidate {
  id: string;
  pairProfileUrl: string;
  profile: RawProfile | null;
}

interface RawMatch {
  id: string;
  score: number;
  reason: string;
  candidate: RawCandidate;
  invitation: { id: string; text: string } | null;
  session: { id: string; state: string; summaryId: string | null } | null;
}

interface RawA2AMessage {
  id: string;
  round: number;
  speaker: RawProfile | null;
  content: string;
}

interface RawA2ASession {
  id: string;
  matchId: string;
  state: string;
  totalRounds: number;
  completedRounds: number;
  messages: RawA2AMessage[];
  summaryId: string | null;
}

interface RawSummary {
  id: string;
  alignmentScore: number;
  scoreReason: string;
  yourViewOfThem: string;
  theirViewOfYou: string;
  topics: string[];
  riskNote: string;
}

interface RawLogin {
  accessToken: string;
  user: { id: string; pairProfileUrl: string; hasProfile: boolean };
}

interface RawSendResponse {
  matchId: string;
  state: string;
  sessionId: string;
  summaryId: string | null;
}

// ---------------------------------------------------------------------------
// Real backend -> view mappers
// ---------------------------------------------------------------------------

// Demo profiles carry no avatarUrl, so fall back to the local prototype PNGs
// (keyed by public slug) instead of rendering a blank <image>.
const DEMO_AVATARS: Record<string, string> = {
  'sarah-chen': '/assets/prototype/person-sarah.png',
  'daniel-liu': '/assets/prototype/person-david.png',
  'jessie-wu': '/assets/prototype/person-jessie.png',
  'kevin-zhao': '/assets/prototype/person-david.png',
  'nina-park': '/assets/prototype/person-sarah.png',
  'leo-chen': '/assets/prototype/person-david.png',
  'mia-tan': '/assets/prototype/person-jessie.png',
};
const FALLBACK_AVATAR = '/assets/prototype/person-jessie.png';

function mapPerson(candidate: RawCandidate): PersonView {
  const profile = candidate.profile;
  const name = profile?.name ?? '未命名';
  const avatarSrc =
    profile?.avatarUrl || DEMO_AVATARS[candidate.pairProfileUrl] || FALLBACK_AVATAR;
  return {
    id: candidate.id,
    initial: name.charAt(0) || '·',
    avatarSrc,
    name,
    headline: profile?.headline ?? '',
    tags: profile?.tags ?? [],
    bio: profile?.bio ?? '',
    status: '',
    statusKind: 'potential',
  };
}

function mapMatch(raw: RawMatch): MatchView {
  return {
    id: raw.id,
    score: raw.score,
    // The match view carries no expiry; hidden until the backend exposes one
    // (backend-integration-plan.md §4-C).
    expiresInHours: 0,
    person: mapPerson(raw.candidate),
    whyMatch: raw.reason,
    intro: raw.invitation?.text ?? '',
    // Topics come from the post-A2A summary; empty on the pre-A2A match card.
    topics: [],
  };
}

function mapStatus(state: string): A2ASessionStatus {
  if (state === 'completed' || state === 'aborted' || state === 'failed') {
    return state;
  }
  return 'running'; // pending | running
}

function mapA2ASession(raw: RawA2ASession, summaryView?: A2ASummaryView): A2ASessionView {
  const total = raw.totalRounds || A2A_TOTAL_MESSAGES;
  const current = raw.completedRounds;
  const status = mapStatus(raw.state);
  const remaining = Math.max(0, total - current);
  return {
    sessionId: raw.id,
    status,
    currentRound: current,
    totalRounds: total,
    // progress / estimatedSeconds are derived client-side (plan §4-A).
    progress: status === 'completed' ? 100 : total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0,
    estimatedSeconds: status === 'completed' ? 0 : remaining * (A2A_POLL_INTERVAL_MS / 1000),
    messages: raw.messages.map((message) => ({
      id: message.id,
      speaker: message.speaker?.name ?? '对方 Agent',
      content: message.content,
    })),
    summary: summaryView,
  };
}

function mapSummary(raw: RawSummary): A2ASummaryView {
  return {
    score: raw.alignmentScore,
    // Backend has no one-line field; fall back to the score reason (plan §4-B).
    oneLine: raw.scoreReason || raw.yourViewOfThem || '',
    topics: raw.topics,
    risk: raw.riskNote || undefined,
    yourView: raw.yourViewOfThem,
    theirView: raw.theirViewOfYou,
  };
}

// ---------------------------------------------------------------------------
// Mock A2A session simulation
// ---------------------------------------------------------------------------

interface MockSession {
  startedAt: number;
  aborted: boolean;
}

const mockSessions: Record<string, MockSession> = {};

function ensureMockSession(sessionId: string): MockSession {
  let session = mockSessions[sessionId];
  if (!session) {
    session = { startedAt: Date.now(), aborted: false };
    mockSessions[sessionId] = session;
  }
  return session;
}

function computeMockSession(sessionId: string): A2ASessionView {
  const session = ensureMockSession(sessionId);
  const total = dialogueMessages.length;

  if (session.aborted) {
    const revealed = Math.max(1, total - 1);
    return {
      sessionId,
      status: 'aborted',
      currentRound: Math.min(A2A_ROUNDS_PER_SIDE, revealed),
      totalRounds: A2A_ROUNDS_PER_SIDE,
      progress: 52,
      estimatedSeconds: 0,
      messages: dialogueMessages.slice(0, revealed),
    };
  }

  const elapsed = Date.now() - session.startedAt;
  const revealed = Math.min(total, 1 + Math.floor(elapsed / A2A_POLL_INTERVAL_MS));
  const completed = revealed >= total;

  return {
    sessionId,
    status: completed ? 'completed' : 'running',
    currentRound: Math.min(A2A_ROUNDS_PER_SIDE, revealed),
    totalRounds: A2A_ROUNDS_PER_SIDE,
    progress: Math.round((revealed / total) * 100),
    estimatedSeconds: (total - revealed) * (A2A_POLL_INTERVAL_MS / 1000),
    messages: dialogueMessages.slice(0, revealed),
    summary: completed
      ? {
          score: summary.score,
          oneLine: summary.oneLine,
          topics: summary.topics,
          risk: summary.risk,
          yourView: summary.yourView,
          theirView: summary.theirView,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Mock/dev login. Returns and persists a normalized `{ token }`. */
export function login(): Promise<{ token: string; hasProfile: boolean }> {
  if (USE_MOCK) {
    const token = 'mock-token';
    setToken(token);
    return Promise.resolve({ token, hasProfile: false });
  }
  // mock-login requires a body (MockLoginDto) and returns `accessToken`.
  return request<RawLogin>('POST', '/auth/mock-login', {
    provider: 'email',
    providerId: 'devtools@pair.local',
    name: 'DevTools User',
  }).then((res) => {
    setToken(res.accessToken);
    return { token: res.accessToken, hasProfile: res.user.hasProfile };
  });
}

/** Today's match candidates. */
export function fetchMatches(): Promise<MatchView[]> {
  if (USE_MOCK) {
    return Promise.resolve(todayMatches);
  }
  // Today shows only matches not yet sent; started ones move to the Chats tab.
  return request<RawMatch[]>('GET', '/matches').then((rows) =>
    rows.filter((match) => !match.session).map(mapMatch),
  );
}

/** Dismiss a match so it stops appearing in Today. */
export function passMatch(matchId: string): Promise<void> {
  if (USE_MOCK) {
    return Promise.resolve();
  }
  return request<void>('POST', `/matches/${matchId}/pass`);
}

/** Send a match, which starts an A2A session, and return its id. */
export function sendMatch(matchId: string): Promise<{ sessionId: string }> {
  if (USE_MOCK) {
    const sessionId = `session_${matchId}`;
    mockSessions[sessionId] = { startedAt: Date.now(), aborted: false };
    return Promise.resolve({ sessionId });
  }
  return request<RawSendResponse>('POST', `/matches/${matchId}/send`)
    .then((res) => ({ sessionId: res.sessionId }))
    .catch((error: ApiError) => {
      // Already started: reuse the existing session id from the 409 details.
      const details = error.details as { sessionId?: string } | undefined;
      if (error.code === 'A2A_ALREADY_STARTED' && details?.sessionId) {
        return { sessionId: details.sessionId };
      }
      throw error;
    });
}

/** Read the current A2A session state (used for polling). */
export function getA2ASession(sessionId: string): Promise<A2ASessionView> {
  if (USE_MOCK) {
    return Promise.resolve(computeMockSession(sessionId));
  }
  return request<RawA2ASession>('GET', `/a2a/${sessionId}`).then((raw) => {
    if (raw.summaryId && mapStatus(raw.state) === 'completed') {
      return getSummary(raw.summaryId)
        .then((summaryView) => mapA2ASession(raw, summaryView))
        .catch(() => mapA2ASession(raw));
    }
    return mapA2ASession(raw);
  });
}

/** Abort an A2A session and stop further generation. */
export function abortA2ASession(sessionId: string): Promise<A2ASessionView> {
  if (USE_MOCK) {
    ensureMockSession(sessionId).aborted = true;
    return Promise.resolve(computeMockSession(sessionId));
  }
  return request<RawA2ASession>('POST', `/a2a/${sessionId}/abort`).then((raw) => mapA2ASession(raw));
}

/** Fetch a generated A2A summary by id. */
export function getSummary(summaryId: string): Promise<A2ASummaryView> {
  if (USE_MOCK) {
    return Promise.resolve({
      score: summary.score,
      oneLine: summary.oneLine,
      topics: summary.topics,
      risk: summary.risk,
      yourView: summary.yourView,
      theirView: summary.theirView,
    });
  }
  return request<RawSummary>('GET', `/summaries/${summaryId}`).then(mapSummary);
}

// ---------------------------------------------------------------------------
// Chats (A2A history) — derived from matches that already have a session.
// ---------------------------------------------------------------------------

export interface ChatItemView {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  state: 'completed' | 'running' | 'failed';
  stateLabel: string;
  sessionId: string;
  summaryId?: string;
}

function mapChat(match: RawMatch): ChatItemView {
  const session = match.session as { id: string; state: string; summaryId: string | null };
  const name = match.candidate.profile?.name ?? '对方';
  const done = session.state === 'completed' || Boolean(session.summaryId);
  const aborted = session.state === 'aborted';
  const failed = session.state === 'failed';
  const state: ChatItemView['state'] = done ? 'completed' : aborted || failed ? 'failed' : 'running';
  const stateLabel = done ? '已完成' : aborted ? '已中止' : failed ? '失败' : '对齐中';
  const subtitle = done
    ? 'Summary 已生成'
    : aborted
      ? '对话已中止'
      : failed
        ? '本轮对齐失败'
        : '两个 Agent 正在对齐';
  return {
    id: session.id,
    title: name,
    subtitle,
    detail: match.reason,
    state,
    stateLabel,
    sessionId: session.id,
    summaryId: session.summaryId ?? undefined,
  };
}

/** A2A history for the Chats tab: matches that already started a session. */
export function fetchChats(): Promise<ChatItemView[]> {
  if (USE_MOCK) {
    return Promise.resolve([]);
  }
  return request<RawMatch[]>('GET', '/matches').then((rows) =>
    rows.filter((match) => match.session).map(mapChat),
  );
}

// ---------------------------------------------------------------------------
// People (connections) — derived from matches: with session = established,
// without session = potential.
// ---------------------------------------------------------------------------

export interface PersonItemView {
  id: string;
  name: string;
  headline: string;
  avatarSrc: string;
  status: string;
  statusKind: 'completed' | 'running' | 'potential';
  sessionId?: string;
  summaryId?: string;
  // Potential-person detail fields shown in the match drawer.
  whyMatch?: string;
  intro?: string;
  topics?: string[];
}

function mapPersonItem(match: RawMatch): PersonItemView {
  const person = mapPerson(match.candidate);
  const session = match.session;
  if (session) {
    const done = session.state === 'completed' || Boolean(session.summaryId);
    return {
      id: match.id,
      name: person.name,
      headline: person.headline,
      avatarSrc: person.avatarSrc,
      status: done ? 'Summary 已完成' : 'Pair 正在对齐',
      statusKind: done ? 'completed' : 'running',
      sessionId: session.id,
      summaryId: session.summaryId ?? undefined,
    };
  }
  return {
    id: match.id,
    name: person.name,
    headline: person.headline,
    avatarSrc: person.avatarSrc,
    status: '潜在连接',
    statusKind: 'potential',
    whyMatch: match.reason,
    intro: match.invitation?.text ?? '',
    topics: [],
  };
}

/** All connections for the People tab (established + potential). */
export function fetchPeople(): Promise<PersonItemView[]> {
  if (USE_MOCK) {
    return Promise.resolve([]);
  }
  return request<RawMatch[]>('GET', '/matches').then((rows) => rows.map(mapPersonItem));
}

// ---------------------------------------------------------------------------
// Me
// ---------------------------------------------------------------------------

export interface MeView {
  name: string;
  headline: string;
  bio: string;
  tags: string[];
  pairProfileUrl: string;
  publicPagePublished: boolean;
}

interface RawMe {
  id: string;
  pairProfileUrl: string;
  profile: RawProfile | null;
  publicPage: { isPublished: boolean } | null;
}

interface RawPublicPage {
  slug: string;
  publicPage: { isPublished: boolean } | null;
}

export function getMe(): Promise<MeView> {
  if (USE_MOCK) {
    return Promise.resolve({
      name: viewerProfile.name,
      headline: viewerProfile.headline,
      bio: viewerProfile.bio,
      tags: viewerProfile.tags,
      pairProfileUrl: '',
      publicPagePublished: false,
    });
  }
  return request<RawMe>('GET', '/me').then((raw) => ({
    name: raw.profile?.name ?? '',
    headline: raw.profile?.headline ?? '',
    bio: raw.profile?.bio ?? '',
    tags: raw.profile?.tags ?? [],
    pairProfileUrl: raw.pairProfileUrl,
    publicPagePublished: Boolean(raw.publicPage?.isPublished),
  }));
}

export function getPublicPageMe(): Promise<{ publicPagePublished: boolean }> {
  if (USE_MOCK) {
    return Promise.resolve({ publicPagePublished: false });
  }
  return request<RawPublicPage>('GET', '/public-pages/me').then((raw) => ({
    publicPagePublished: Boolean(raw.publicPage?.isPublished),
  }));
}

export function publishPublicPage(): Promise<void> {
  if (USE_MOCK) {
    return Promise.resolve();
  }
  return request<void>('PATCH', '/public-pages/me', { isPublished: true });
}
