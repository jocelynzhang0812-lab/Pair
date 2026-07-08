/**
 * `@pair/shared` · 跨端共享常量。
 *
 * 来源：`memory-bank/design-document.md` §5.8（Supertag 库）、§4.3（A2A 双模式）、
 * `Pair-PRD.md` §1.4（A2A 规格）、`decisions.md` §7（A2A 轮次与轮询）。
 *
 * 注意：标签 id 不含 `#` 前缀（`#` 仅用于展示）。
 */

/* -------------------------------------------------------------------------- */
/*  Supertag 库（design-document.md §5.8 “Supertag 库（V1）”）                 */
/* -------------------------------------------------------------------------- */

/** 按类别分组的规范 supertag 库（V1）。 */
export const SUPERTAGS = {
  /** 角色类。 */
  role: ['cofounder', 'mentor', 'mentee', 'peer', 'investor', 'advisor'],
  /** 行业类。 */
  industry: ['ai-pm', 'design', 'engineering', 'growth', 'bd'],
  /** 阶段类。 */
  stage: ['student', 'early-career', 'manager', 'director', 'founder'],
  /** 状态类。 */
  status: ['open-to-chat', 'hiring', 'fundraising', 'exploring'],
} as const;

/** supertag 分类名。 */
export type SupertagCategory = keyof typeof SUPERTAGS;

/** 扁平化的全部规范 supertag（保持类别顺序）。 */
export const ALL_SUPERTAGS = [
  ...SUPERTAGS.role,
  ...SUPERTAGS.industry,
  ...SUPERTAGS.stage,
  ...SUPERTAGS.status,
] as const;

/** 规范 supertag 的联合类型（供 picker 等强类型场景使用）。 */
export type CanonicalSupertag = (typeof ALL_SUPERTAGS)[number];

/** 判断某字符串是否为规范 supertag。 */
export function isCanonicalSupertag(tag: string): tag is CanonicalSupertag {
  return (ALL_SUPERTAGS as readonly string[]).includes(tag);
}

/* -------------------------------------------------------------------------- */
/*  A2A 对话模式（design-document.md §4.1 屏6 / §4.3）                         */
/* -------------------------------------------------------------------------- */

/**
 * A2A 默认模式：托付型（delegated）为默认，参与型（collaborative）可切换。
 *
 * 命名对齐 design-document 的中文术语：
 * - 托付型 = delegated：Agent 全自动谈，用户只看 Summary。
 * - 参与型 = collaborative：Agent 起草每条，用户审后发出。
 */
export const A2A_CONTROL_MODES = ['delegated', 'collaborative'] as const;

/**
 * A2A 消息来源。
 *
 * 用于参与型模式下区分消息是 Agent 自动生成、用户直接接管，还是用户编辑后发出。
 */
export const A2A_MESSAGE_SOURCES = [
  'agent_auto',
  'user_takeover',
  'user_edited',
] as const;

/* -------------------------------------------------------------------------- */
/*  A2A 轮次与轮询（decisions.md §7 + PRD §1.4）                               */
/* -------------------------------------------------------------------------- */

/** 每方 Agent 发言次数（decisions.md §7：双方各 5 次）。 */
export const A2A_ROUNDS_PER_SIDE = 5;

/**
 * A2A 一次会话总消息数（decisions.md §7：共 10 条）。
 *
 * design-document §4.3 描述为“5 轮对齐”，每轮包含双方各一次发言，因此总消息数为 10。
 */
export const A2A_TOTAL_MESSAGES = 10;

/** A2A 实时预览轮询间隔（毫秒，decisions.md §7：2 秒一次）。 */
export const A2A_POLL_INTERVAL_MS = 2_000;

/** 单条消息长度上限（字，PRD §1.4：≤ 200 字）。 */
export const A2A_MESSAGE_MAX_CHARS = 200;

/** 单轮 LLM 超时（毫秒，PRD §1.4：30s 视为失败）。 */
export const A2A_ROUND_TIMEOUT_MS = 30_000;

/** 整场对话硬超时（毫秒，PRD §1.4 / decisions.md：5 分钟兜底）。 */
export const A2A_DIALOGUE_HARD_STOP_MS = 5 * 60 * 1_000;

/**
 * 参与型模式下用户审稿超时（毫秒，design-document §4.3.2：24h 后自动切回托付型）。
 */
export const A2A_USER_REVIEW_TIMEOUT_MS = 24 * 60 * 60 * 1_000;

/* -------------------------------------------------------------------------- */
/*  Summary 与对齐度（PRD §1.4）                                               */
/* -------------------------------------------------------------------------- */

/** 总结中建议话题条数（PRD §1.4：3 条）。 */
export const A2A_SUMMARY_TOPIC_COUNT = 3;

/** 对齐度评分下限。 */
export const ALIGNMENT_SCORE_MIN = 0;

/** 对齐度评分上限。 */
export const ALIGNMENT_SCORE_MAX = 10;

/* -------------------------------------------------------------------------- */
/*  其它 Phase 1 业务限制（PRD §1.x / design-document §4.1）                    */
/* -------------------------------------------------------------------------- */

/** 目标选择数量范围（PRD 屏5 / design-document §4.1：从 4 项中选 1–3 项）。 */
export const OBJECTIVE_SELECT_MIN = 1;
export const OBJECTIVE_SELECT_MAX = 3;

/** 开场白长度上限（字，PRD §1.3：≤ 100 字）。 */
export const INTRO_MAX_CHARS = 100;

/** 档案简介长度上限（字，design §4.4：约 80 字）。 */
export const PROFILE_BIO_MAX_CHARS = 80;

/** 单次触发推送的 Match 卡片数量上限（PRD §1.2：1–3 张）。 */
export const MATCH_CARDS_PER_TRIGGER_MAX = 3;

/** 会后反馈评分范围（PRD §1.5：1–5）。 */
export const FEEDBACK_SCORE_MIN = 1;
export const FEEDBACK_SCORE_MAX = 5;
