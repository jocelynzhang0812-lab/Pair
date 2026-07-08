import type { A2AMessage, A2ASummary, Objective, Profile } from '@pair/shared';

export interface MatchCardView {
  id: string;
  score: number;
  expiresInHours: number;
  candidate: Profile;
  whyMatch: string;
  activeIntro: string;
  topics: string[];
  session?: {
    id: string;
    state: string;
    summaryId: string | null;
  } | null;
}

export const viewerProfile: Profile = {
  name: '章璟菲',
  headline: 'AI PM at Moonshot · HKU CS Year 2',
  avatarUrl: undefined,
  tags: ['ai-pm', 'moonshot', 'early-stage'],
  bio: '在 Moonshot 做 AI 产品，关注 Agent 产品体验、系统化判断和高质量职业连接。',
  sourceLinks: [{ platform: 'website', url: 'https://pair.app/u/jingfei' }],
};

export const candidateProfile: Profile = {
  name: 'Sarah Chen',
  headline: 'Senior PM at Stripe',
  avatarUrl: undefined,
  tags: ['ai-pm', 'early-stage'],
  bio: '从 Stripe infra 转向 AI 产品，正在探索 early-stage AI startup 的产品机会。',
  sourceLinks: [{ platform: 'linkedin', url: 'https://linkedin.com/in/sarah' }],
};

export const objectives: Objective[] = [
  { kind: 'mentor', side: 'a' },
  { kind: 'cross_industry', side: 'b' },
];

export const todayMatches: MatchCardView[] = [
  {
    id: 'match_sarah',
    score: 86,
    expiresInHours: 32,
    candidate: candidateProfile,
    whyMatch: 'Both exploring early AI startups. She just left infra-heavy work and is now thinking about AI product...',
    activeIntro:
      'Hi Sarah, your transition from infra to product caught my eye...',
    topics: ['AI PM 成长路径', 'early-stage AI', 'first-principle 产品判断'],
  },
  {
    id: 'match_daniel',
    score: 74,
    expiresInHours: 46,
    candidate: {
      name: 'Daniel Liu',
      headline: 'AI 研究员 @ Moonshot',
      avatarUrl: undefined,
      tags: ['engineering', 'ai-pm'],
      bio: '关注多 Agent 协作、产品化验证和 AI infra。',
    },
    whyMatch: 'You both care about agent systems, but from product and research sides.',
    activeIntro: 'Daniel，你和 jingfei 对 Agent 产品化的关注点可能很互补。',
    topics: ['Agent systems', 'AI infra', '产品化验证'],
  },
];

export const dialogueMessages: A2AMessage[] = [
  {
    id: 'm1',
    sessionId: 'session_sarah',
    round: 1,
    speakerAgentUserId: 'viewer',
    content: '我是 jingfei 的 Agent。她近期在做 AI PM，想找能一起讨论早期 AI 产品判断的人。',
    source: 'agent_auto',
    redactedSpans: [],
  },
  {
    id: 'm2',
    sessionId: 'session_sarah',
    round: 1,
    speakerAgentUserId: 'sarah',
    content: '我是 Sarah 的 Agent。她最近从 Stripe infra 转 PM，重点关注 first-principle 的产品机会。',
    source: 'agent_auto',
    redactedSpans: [],
  },
  {
    id: 'm3',
    sessionId: 'session_sarah',
    round: 2,
    speakerAgentUserId: 'viewer',
    content: 'jingfei 对多 Agent 系统如何形成真实用户价值很敏感，也在找更成熟的 PM 视角。',
    source: 'agent_auto',
    redactedSpans: [],
  },
  {
    id: 'm4',
    sessionId: 'session_sarah',
    round: 2,
    speakerAgentUserId: 'sarah',
    content: 'Sarah 会愿意聊这个方向，尤其是从 infra 经验迁移到 AI 产品判断的部分。',
    source: 'agent_auto',
    redactedSpans: [],
  },
  {
    id: 'm5',
    sessionId: 'session_sarah',
    round: 3,
    speakerAgentUserId: 'viewer',
    content: '双方都适合先围绕 early-stage AI、PM 成长路径和 first-principle 判断对齐。',
    source: 'agent_auto',
    redactedSpans: [],
  },
];

export const summary: A2ASummary = {
  id: 'summary_sarah',
  sessionId: 'session_sarah',
  yourViewOfThem:
    'Sarah 从 Stripe infra 转 PM，正在探索更早期的 AI 产品机会，对 multi-agent 系统有 first-hand 经验。',
  theirViewOfYou:
    'Sarah 会看到你在 AI 公司 PM 实习，对 Agent 类产品和 first-principle 判断有持续关注。',
  topics: ['AI PM 成长路径', 'Moonshot 和 Stripe 的产品方法', '早期 AI 产品判断'],
  alignmentScore: 8,
  scoreReason: '都在 early-stage AI，并且重视产品判断和系统化思考。',
  riskNote: null,
  generatedAt: '2026-06-30T12:02:00.000Z',
};
