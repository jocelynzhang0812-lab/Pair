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
export {};
//# sourceMappingURL=types.js.map