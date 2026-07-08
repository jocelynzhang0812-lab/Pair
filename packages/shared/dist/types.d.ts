/**
 * `@pair/shared` · 跨端共享领域类型。
 *
 * 这些是三端（小程序 / Web / API）统一使用的概念模型，目的是“避免各端各自命名”
 * (implement-plan P2-02)。字段对照 `Pair-PRD-前三期.md` §1.6 数据模型与
 * `memory-bank/design-document.md` 的 UI / 流程描述。
 *
 * 约定：
 * - 时间戳一律用 ISO 8601 字符串（跨端 JSON 安全，避免 `Date` 序列化问题）。
 * - 字段命名为 camelCase；对应 PRD 的 snake_case 列名在注释中标注。
 * - PRD 中以 JSON / 派生视图存在、无独立表的概念（Profile / SocialLink /
 *   Objective / Invitation / PublicPage）按最严格定义建模，来源在注释中说明，
 *   并在 `decisions.md` §12 标注待人工确认。
 */
/** 登录方式（PRD `users.auth_provider`）。 */
export type AuthProvider = 'email' | 'wechat' | 'google';
/**
 * 社交来源链接。
 *
 * PRD 中并无独立 `social_links` 表——onboarding 仅一次性粘贴一个来源 URL
 * （LinkedIn / 小红书 / 个人主页，PRD §1.3 / 屏3）。此处按最严格定义建模，
 * 供档案来源记录使用。待人工确认（decisions.md §12）。
 */
export type SocialPlatform = 'linkedin' | 'xiaohongshu' | 'website' | 'other';
export interface SocialLink {
    platform: SocialPlatform;
    url: string;
}
/**
 * A2A 对话托管模式（design-document §4.1 屏6）。
 *
 * - `delegated`：托付型，Agent 全自动谈，用户只看 Summary。
 * - `collaborative`：参与型，Agent 起草每条消息，用户审后发出。
 */
export type A2AControlMode = 'delegated' | 'collaborative';
/**
 * A2A 单条消息来源（implement-plan P3-03 / P4-05）。
 *
 * - `agent_auto`：Agent 自动生成（托付型或参与型用户放行）。
 * - `user_takeover`：用户接管，直接输入内容后发出。
 * - `user_edited`：用户编辑 Agent 草稿后发出。
 */
export type A2AMessageSource = 'agent_auto' | 'user_takeover' | 'user_edited';
/**
 * 用户档案（PRD `users.pair_profile` 内嵌 JSON）。
 *
 * 文档仅以 UI 形式描述（Onboarding 屏4 档案预览、公开页 §4.5），无字段级 schema。
 * 此处给出最小严格定义，待人工确认（decisions.md §12）。
 */
export interface Profile {
    /** 姓名（可编辑）。 */
    name: string;
    /** 一句话身份，如 “Senior PM at Stripe · San Francisco”。 */
    headline: string;
    /** 头像 URL（“如有”，可选）。 */
    avatarUrl?: string;
    /** 关键标签（chips）。规范取值见 `constants.ts` 的 SUPERTAGS，但允许自定义标签。 */
    tags: string[];
    /** 简介，约 80 字。 */
    bio: string;
    /** 档案来源链接（onboarding 粘贴的 URL）。 */
    sourceLinks?: SocialLink[];
}
/**
 * 目标（PRD `users.objectives` JSON 数组元素 `{kind, side}`）。
 *
 * 用户从 4 组互补选项中选 1–3 项（PRD 屏5、design §4.4 屏5）。`kind` 标识互补对，
 * `side` 标识用户选的是哪一半。`side` 的确切语义文档未明确，先用严格枚举占位，
 * 待人工确认（decisions.md §12）。
 */
export type ObjectiveKind = 'startup' | 'mentor' | 'cross_industry' | 'cofound';
/** 互补对中的哪一半：`a` / `b` 分别对应该 kind 的两句互补文案。 */
export type ObjectiveSide = 'a' | 'b';
export interface Objective {
    kind: ObjectiveKind;
    side: ObjectiveSide;
}
/** 用户（PRD `users` 表）。 */
export interface User {
    id: string;
    /** 登录方式（auth_provider）。 */
    authProvider: AuthProvider;
    /** 第三方账号标识（auth_provider_id）。 */
    authProviderId: string;
    /** 公开页 slug，对应 pair.app/u/{slug}（pair_profile_url）。 */
    pairProfileUrl: string;
    /** v0 档案 JSON（pair_profile）。 */
    pairProfile: Profile;
    /** 目标数组（objectives），1–3 项。 */
    objectives: Objective[];
    /** 每周可见面配额（meeting_quota_per_week）。 */
    meetingQuotaPerWeek: number;
    /** 偏好时段（preferred_time_slots）；文档未定义结构，按 ISO 时间字符串数组建模。 */
    preferredTimeSlots: string[];
    /** A2A 默认对话模式（design-document §4.1 屏6；PRD `users.a2a_default_mode`）。 */
    a2aDefaultMode: A2AControlMode;
    /** 邀请码（invite_code），可空。 */
    inviteCode: string | null;
}
/**
 * Match 状态机（PRD `matches.state`）。
 *
 * 注意：Phase 1 中“发出”即直接启动 A2A（decisions.md §8），不经过对方接受，
 * 但 PRD 列出的状态集合保留完整以兼容后续阶段。
 */
export type MatchStatus = 'pending' | 'a_accepted' | 'b_accepted' | 'both_accepted' | 'dialogue_running' | 'dialogue_done' | 'scheduled' | 'done' | 'rejected';
/** Match（PRD `matches` 表）。 */
export interface Match {
    id: string;
    /** 创建时间（ISO）。 */
    createdAt: string;
    /** 一方用户 id（user_a_id）。 */
    userAId: string;
    /** 另一方用户 id（user_b_id）。 */
    userBId: string;
    /** 命中的目标类型（objective_kind）。 */
    objectiveKind: ObjectiveKind;
    /** 匹配分（score）。 */
    score: number;
    /** Agent 生成的匹配理由（reason）。 */
    reason: string;
    /** 状态（state）。 */
    state: MatchStatus;
}
/** 开场白文案风格（PRD `intros.variant`）。 */
export type IntroVariant = 'professional' | 'casual' | 'story';
/**
 * 邀约 / 开场白（PRD `intros` 表）。
 *
 * 文档无独立 `invitations` 表；“邀约”本身是 Match Card 上的动作 + MatchStatus 流转，
 * 其携带的可落库记录是 Agent 起草的开场白（intros）。此类型即对应该记录。
 */
export interface Invitation {
    id: string;
    /** 所属 Match（match_id）。 */
    matchId: string;
    /** 生成时间（ISO，generated_at）。 */
    generatedAt: string;
    /** 开场白文本，≤ 100 字（text）。 */
    text: string;
    /** 文案风格（variant）。 */
    variant: IntroVariant;
    /** 是否当前生效版本（is_active）。 */
    isActive: boolean;
}
/** A2A 会话状态（PRD `dialogues.state`）。 */
export type A2ASessionState = 'pending' | 'running' | 'completed' | 'aborted' | 'failed';
/** A2A 会话（PRD `dialogues` 表）。 */
export interface A2ASession {
    id: string;
    /** 所属 Match（match_id）。 */
    matchId: string;
    /** 状态（state）。 */
    state: A2ASessionState;
    /** 总轮次，默认 5（total_rounds）。见 constants 的 A2A_ROUNDS_PER_SIDE。 */
    totalRounds: number;
    /** 开始时间（ISO，started_at），未开始为 null。 */
    startedAt: string | null;
    /** 完成时间（ISO，completed_at），未完成为 null。 */
    completedAt: string | null;
}
/**
 * A2A 发言方角色。
 *
 * PRD 不存独立 role 字段，发言方由 `speaker_agent_user_id` 标识；但概念上恒为两方：
 * 发起方（initiator）与接收方（receiver），由 speaker 与 Match 的 user_a/user_b 推导。
 */
export type A2ARole = 'initiator' | 'receiver';
/** 被脱敏的文本片段（PRD `dialogue_messages.redacted_spans`，对应屏蔽联系方式规则）。 */
export interface RedactedSpan {
    /** 起始下标（含）。 */
    start: number;
    /** 结束下标（不含）。 */
    end: number;
    /** 脱敏原因。 */
    kind?: 'phone' | 'email' | 'id_number' | 'other';
}
/** A2A 单条消息（PRD `dialogue_messages` 表）。 */
export interface A2AMessage {
    id: string;
    /** 所属会话（dialogue_id）。 */
    sessionId: string;
    /** 第几轮（round）。 */
    round: number;
    /** 发言 Agent 所属用户（speaker_agent_user_id）。 */
    speakerAgentUserId: string;
    /** 消息正文，≤ 200 字（content）。 */
    content: string;
    /** 消息来源：Agent 自动生成 / 用户接管 / 用户编辑后发出。 */
    source: A2AMessageSource;
    /** 被脱敏的片段（redacted_spans）。 */
    redactedSpans: RedactedSpan[];
}
/** 对齐度评分，整数 0–10（PRD `summaries.alignment_score`）。 */
export type AlignmentScore = number;
/** A2A 总结（PRD `summaries` 表 + §1.4 结构化输出）。 */
export interface A2ASummary {
    id: string;
    /** 所属会话（dialogue_id）。 */
    sessionId: string;
    /** 给发起方看的 80 字摘要（your_view_of_them）。 */
    yourViewOfThem: string;
    /** 给接收方看的 80 字摘要（their_view_of_you）。 */
    theirViewOfYou: string;
    /** 3 条可聊话题（topics）。 */
    topics: string[];
    /** 对齐度 0–10（alignment_score）。 */
    alignmentScore: AlignmentScore;
    /** 评分理由，一句话（score_reason）。 */
    scoreReason: string;
    /** 风险提示，可选；无则为 null（risk_note）。 */
    riskNote: string | null;
    /** 生成时间（ISO，generated_at）。 */
    generatedAt: string;
}
/** 见面状态（PRD `meetings.state`）。Phase 1 仅占位，安排见面在 Phase 2 落地。 */
export type MeetingStatus = 'scheduled' | 'done' | 'cancelled';
/** 见面（PRD `meetings` 表）。 */
export interface Meeting {
    id: string;
    /** 所属 Match（match_id）。 */
    matchId: string;
    /** 约定时间（ISO，scheduled_at）。 */
    scheduledAt: string;
    /** 自动生成的会议链接：腾讯会议 / Google Meet（meeting_url）。 */
    meetingUrl: string;
    /** 状态（state）。 */
    state: MeetingStatus;
}
/** 会后反馈（PRD `feedback` 表）。 */
export interface FeedbackCard {
    id: string;
    /** 所属见面（meeting_id）。 */
    meetingId: string;
    /** 提交反馈的用户（user_id）。 */
    userId: string;
    /** 评分 1–5（score）。 */
    score: number;
    /** 一句话标签（tags）。 */
    tags: string[];
    /** 文字评价（comment）。 */
    comment: string;
    /** 提交时间（ISO，submitted_at）。 */
    submittedAt: string;
}
/**
 * 公开档案页（PRD F1.14 / design §4.5，pair.app/u/{slug}）。
 *
 * 文档无独立表——它是 User 的派生公开视图（pair_profile_url + pair_profile）。
 * 公开页不暴露手机号 / 邮箱 / 实时位置（design 约束）。
 */
export interface PublicPage {
    /** slug（pair_profile_url）。 */
    slug: string;
    /** 公开档案（来自 User.pairProfile 的安全投影）。 */
    profile: Profile;
    /** 自动生成的 OG 分享图 URL。 */
    ogImageUrl: string;
}
//# sourceMappingURL=types.d.ts.map