/**
 * `@pair/shared` · 跨端共享常量。
 *
 * 来源：`memory-bank/design-document.md` §5.8（Supertag 库）、§4.3（A2A 双模式）、
 * `Pair-PRD.md` §1.4（A2A 规格）、`decisions.md` §7（A2A 轮次与轮询）。
 *
 * 注意：标签 id 不含 `#` 前缀（`#` 仅用于展示）。
 */
/** 按类别分组的规范 supertag 库（V1）。 */
export declare const SUPERTAGS: {
    /** 角色类。 */
    readonly role: readonly ["cofounder", "mentor", "mentee", "peer", "investor", "advisor"];
    /** 行业类。 */
    readonly industry: readonly ["ai-pm", "design", "engineering", "growth", "bd"];
    /** 阶段类。 */
    readonly stage: readonly ["student", "early-career", "manager", "director", "founder"];
    /** 状态类。 */
    readonly status: readonly ["open-to-chat", "hiring", "fundraising", "exploring"];
};
/** supertag 分类名。 */
export type SupertagCategory = keyof typeof SUPERTAGS;
/** 扁平化的全部规范 supertag（保持类别顺序）。 */
export declare const ALL_SUPERTAGS: readonly ["cofounder", "mentor", "mentee", "peer", "investor", "advisor", "ai-pm", "design", "engineering", "growth", "bd", "student", "early-career", "manager", "director", "founder", "open-to-chat", "hiring", "fundraising", "exploring"];
/** 规范 supertag 的联合类型（供 picker 等强类型场景使用）。 */
export type CanonicalSupertag = (typeof ALL_SUPERTAGS)[number];
/** 判断某字符串是否为规范 supertag。 */
export declare function isCanonicalSupertag(tag: string): tag is CanonicalSupertag;
/**
 * A2A 默认模式：托付型（delegated）为默认，参与型（collaborative）可切换。
 *
 * 命名对齐 design-document 的中文术语：
 * - 托付型 = delegated：Agent 全自动谈，用户只看 Summary。
 * - 参与型 = collaborative：Agent 起草每条，用户审后发出。
 */
export declare const A2A_CONTROL_MODES: readonly ["delegated", "collaborative"];
/**
 * A2A 消息来源。
 *
 * 用于参与型模式下区分消息是 Agent 自动生成、用户直接接管，还是用户编辑后发出。
 */
export declare const A2A_MESSAGE_SOURCES: readonly ["agent_auto", "user_takeover", "user_edited"];
/** 每方 Agent 发言次数（decisions.md §7：双方各 5 次）。 */
export declare const A2A_ROUNDS_PER_SIDE = 5;
/**
 * A2A 一次会话总消息数（decisions.md §7：共 10 条）。
 *
 * design-document §4.3 描述为“5 轮对齐”，每轮包含双方各一次发言，因此总消息数为 10。
 */
export declare const A2A_TOTAL_MESSAGES = 10;
/** A2A 实时预览轮询间隔（毫秒，decisions.md §7：2 秒一次）。 */
export declare const A2A_POLL_INTERVAL_MS = 2000;
/** 单条消息长度上限（字，PRD §1.4：≤ 200 字）。 */
export declare const A2A_MESSAGE_MAX_CHARS = 200;
/** 单轮 LLM 超时（毫秒，PRD §1.4：30s 视为失败）。 */
export declare const A2A_ROUND_TIMEOUT_MS = 30000;
/** 整场对话硬超时（毫秒，PRD §1.4 / decisions.md：5 分钟兜底）。 */
export declare const A2A_DIALOGUE_HARD_STOP_MS: number;
/**
 * 参与型模式下用户审稿超时（毫秒，design-document §4.3.2：24h 后自动切回托付型）。
 */
export declare const A2A_USER_REVIEW_TIMEOUT_MS: number;
/** 总结中建议话题条数（PRD §1.4：3 条）。 */
export declare const A2A_SUMMARY_TOPIC_COUNT = 3;
/** 对齐度评分下限。 */
export declare const ALIGNMENT_SCORE_MIN = 0;
/** 对齐度评分上限。 */
export declare const ALIGNMENT_SCORE_MAX = 10;
/** 目标选择数量范围（PRD 屏5 / design-document §4.1：从 4 项中选 1–3 项）。 */
export declare const OBJECTIVE_SELECT_MIN = 1;
export declare const OBJECTIVE_SELECT_MAX = 3;
/** 开场白长度上限（字，PRD §1.3：≤ 100 字）。 */
export declare const INTRO_MAX_CHARS = 100;
/** 档案简介长度上限（字，design §4.4：约 80 字）。 */
export declare const PROFILE_BIO_MAX_CHARS = 80;
/** 单次触发推送的 Match 卡片数量上限（PRD §1.2：1–3 张）。 */
export declare const MATCH_CARDS_PER_TRIGGER_MAX = 3;
/** 会后反馈评分范围（PRD §1.5：1–5）。 */
export declare const FEEDBACK_SCORE_MIN = 1;
export declare const FEEDBACK_SCORE_MAX = 5;
//# sourceMappingURL=constants.d.ts.map