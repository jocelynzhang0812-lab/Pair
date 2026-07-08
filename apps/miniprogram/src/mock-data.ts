export interface PersonView {
  id: string;
  initial: string;
  avatarSrc: string;
  name: string;
  headline: string;
  tags: string[];
  bio: string;
  status: string;
  statusKind: 'completed' | 'running' | 'potential';
}

export interface MatchView {
  id: string;
  score: number;
  expiresInHours: number;
  person: PersonView;
  whyMatch: string;
  intro: string;
  topics: string[];
}

export interface DialogueMessageView {
  id: string;
  speaker: string;
  content: string;
}

export const viewerProfile: PairMiniProgram.Profile = {
  name: '章璟菲',
  headline: 'AI Agent PM at RedNote · HKU Linguistic Year 2',
  tags: ['AI Agent', 'Moonshot.ai', '小红书'],
  bio: '曾在 Moonshot.ai 做 AI Agent产品，现在在小红书做ToB Agent产品，关注 Agent 技术研究、发展判断和高质量职业连接。',
};

export const people: PersonView[] = [
  {
    id: 'sarah',
    initial: 'S',
    avatarSrc: '/assets/prototype/person-sarah.png',
    name: 'Sarah Chen',
    headline: 'Senior PM @ Stripe',
    tags: ['Ai-PM', 'early-stage'],
    bio: 'AI infra 转 AI 产品经理，正在探索 early-stage AI startup 的工作机会。',
    status: 'Summary 已完成',
    statusKind: 'completed',
  },
  {
    id: 'david',
    initial: 'D',
    avatarSrc: '/assets/prototype/person-david.png',
    name: 'David Liu',
    headline: '世界模型研究员 @ Deepseek',
    tags: ['World Model', 'AI-research'],
    bio: '关注多 Agent 协作、模型评估和 AI infra 产品化。',
    status: 'Pair正在为你对齐',
    statusKind: 'running',
  },
  {
    id: 'jessie',
    initial: 'J',
    avatarSrc: '/assets/prototype/person-jessie.png',
    name: 'Jessie Wu',
    headline: 'Growth @ Tiktok',
    tags: ['growth', 'community'],
    bio: '关注社区增长、AI 工具留存和高质量用户访谈。',
    status: '潜在连接',
    statusKind: 'potential',
  },
];

export const todayMatches: MatchView[] = [
  {
    id: 'match_sarah',
    score: 86,
    expiresInHours: 32,
    person: people[0],
    whyMatch: '你们都在探索 early-stage AI 产品，且都重视 first-principle 的产品判断。',
    intro: 'Hi Sarah，jingfei 最近也在做 Agent 产品，她想和你聊聊 AI PM 的早期判断。',
    topics: ['AI PM 成长路径', 'early-stage AI', '产品判断'],
  },
  {
    id: 'match_david',
    score: 74,
    expiresInHours: 46,
    person: people[1],
    whyMatch: '你们从产品和研究两侧看 Agent 系统，适合先做一次轻量对齐。',
    intro: 'David，你和 jingfei 对 Agent 产品化的关注点可能很互补。',
    topics: ['Agent systems', 'AI infra', '产品化验证'],
  },
];

export const dialogueMessages: DialogueMessageView[] = [
  {
    id: 'm1',
    speaker: '我的 Agent',
    content: 'jingfei 近期在做 AI PM，想找能一起讨论早期 AI 产品判断的人。',
  },
  {
    id: 'm2',
    speaker: 'Sarah 的 Agent',
    content: 'Sarah 从 Stripe infra 转 PM，重点关注 first-principle 的产品机会。',
  },
  {
    id: 'm3',
    speaker: '我的 Agent',
    content: '双方都适合先围绕 early-stage AI、PM 成长路径和 Agent 产品化对齐。',
  },
];

export const summary = {
  score: 8,
  oneLine: '都在 early-stage AI，目标重叠度高。',
  yourView:
    'Sarah 从 Stripe infra 转 PM，正在探索更早期的 AI 产品机会，对多 Agent 系统有真实经验。',
  theirView:
    '她会看到你在 AI 公司做 PM 实习，对 Agent 类产品和 first-principle 判断有持续关注。',
  topics: ['AI PM 成长路径', 'Moonshot 和 Stripe 的产品方法', '早期 AI 产品判断'],
  risk: '双方时间都比较碎，第一次见面适合控制在 30 分钟。',
};

export const objectives = [
  {
    id: 'startup',
    title: '聊聊创业',
    detail: '和正在做 / 想做的人对谈',
  },
  {
    id: 'mentor',
    title: '寻找 mentor',
    detail: '找比你强 3-5 年的同行',
  },
  {
    id: 'cross',
    title: '跨界交换',
    detail: '了解某行发展生态或趋势',
  },
  {
    id: 'cofound',
    title: '找联合创始人',
    detail: '探索长期合作可能',
  },
];

export interface ChatView {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  state: 'completed' | 'running' | 'draft' | 'failed';
  stateLabel: string;
}

export const chats: ChatView[] = [
  {
    id: 'chat_sarah',
    title: 'Sarah Chen',
    subtitle: 'Summary 已生成',
    detail: '都在 early-stage AI，并且重视产品判断。',
    state: 'completed',
    stateLabel: '已完成',
  },
  {
    id: 'chat_david',
    title: 'David Liu',
    subtitle: '第 2 轮 · 预计还要 45 秒',
    detail: '我的 Agent 正在确认对方目标。',
    state: 'running',
    stateLabel: '对齐中',
  },
  {
    id: 'chat_jessie',
    title: 'Jessie Wu',
    subtitle: 'Agent 已草拟开场白',
    detail: '下一轮可继续扫描。',
    state: 'draft',
    stateLabel: '草稿',
  },
  {
    id: 'chat_maya',
    title: 'Maya Lin',
    subtitle: '本轮对齐失败',
    detail: '对方资料不足，Agent 没有完成可信判断。',
    state: 'failed',
    stateLabel: '失败',
  },
];
