# Pair Data Model

> 版本：v0.2 · 2026-06-30
> 用途：定义 Pair MVP 的数据库表结构、关系、状态机与数据约束。
> 实现真源：`apps/api/prisma/schema.prisma`。本文档用于产品、API、UI 对齐。

## 1. 设计原则

- PostgreSQL 作为主库，所有主键使用 UUID。
- Prisma model / API 字段使用 camelCase，数据库表名和列名使用 snake_case。
- 用户可见时间统一返回 ISO 8601 字符串。
- Phase 1 不做复杂社交图谱、搜索、推荐向量库；匹配先基于目标、标签、阶段、行业和新鲜度。
- A2A 对话是核心业务对象，必须可追踪、可重试、可审计。
- 公开档案不得暴露手机号、邮箱、实时位置、登录标识、第三方账号 ID。

## 2. ER 关系

```text
User 1--1 Profile
User 1--n Objective
User 1--n SocialLink
User 1--1 PublicPage

User 1--n Match as userA
User 1--n Match as userB
Match 1--n Invitation
Match 1--1 A2ASession
Match 1--n Meeting

A2ASession 1--n A2AMessage
A2ASession 1--1 A2ASummary

Meeting 1--n FeedbackCard
User 1--n FeedbackCard
```

## 3. Enums

### AuthProvider

| 值 | 含义 |
|---|---|
| `email` | Web email OTP 登录 |
| `wechat` | 微信小程序登录 |
| `google` | Web Google OAuth 登录 |

### ObjectiveKind

| 值 | 含义 |
|---|---|
| `startup` | 创业 / 加入早期项目 |
| `mentor` | 找 mentor / 做 mentor |
| `cross_industry` | 跨行业交流 |
| `cofound` | 找联合创始人 / 合作伙伴 |

### ObjectiveSide

| 值 | 含义 |
|---|---|
| `a` | 互补目标的第一侧 |
| `b` | 互补目标的第二侧 |

### MatchStatus

| 值 | 含义 |
|---|---|
| `pending` | 已生成匹配，用户未处理 |
| `a_accepted` | A 方已接受，保留给后续双向确认 |
| `b_accepted` | B 方已接受，保留给后续双向确认 |
| `both_accepted` | 双方接受，保留给后续阶段 |
| `dialogue_running` | A2A 正在进行 |
| `dialogue_done` | A2A 已完成并生成 Summary |
| `scheduled` | 已安排见面，Phase 2 落地 |
| `done` | 见面完成 |
| `rejected` | 用户跳过或拒绝 |

### IntroVariant

| 值 | 含义 |
|---|---|
| `professional` | 专业正式 |
| `casual` | 轻松自然 |
| `story` | 叙事型 |

### A2ASessionState

| 值 | 含义 |
|---|---|
| `pending` | 已创建，等待队列执行 |
| `running` | 对话生成中 |
| `completed` | 对话完成，Summary 可读取 |
| `aborted` | 用户中断 |
| `failed` | 系统失败，需要重试或降级 |

### MeetingStatus

| 值 | 含义 |
|---|---|
| `scheduled` | 已安排 |
| `done` | 已完成 |
| `cancelled` | 已取消 |

### SocialPlatform

| 值 | 含义 |
|---|---|
| `linkedin` | LinkedIn |
| `xiaohongshu` | 小红书 |
| `website` | 个人网站 |
| `other` | 其它公开来源 |

## 4. Tables

### users

用户账号主表，只保存登录身份和全局偏好。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 用户 ID |
| `auth_provider` | AuthProvider | required | 登录方式 |
| `auth_provider_id` | text | required | 第三方身份标识；Web email 可存 email hash 或 normalized email |
| `pair_profile_url` | text | unique, required | 公开档案 slug 或完整路径 |
| `meeting_quota_per_week` | int | default 3 | 每周可接受见面数量 |
| `invite_code` | text | nullable | 邀请码 |
| `created_at` | timestamp | default now | 创建时间 |
| `updated_at` | timestamp | auto update | 更新时间 |

索引：

- unique: `pair_profile_url`
- 建议补充 unique: `(auth_provider, auth_provider_id)`

### profiles

用户职业档案。Onboarding 生成 draft，用户确认后写入本表。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 档案 ID |
| `user_id` | uuid | unique, FK users.id | 用户 ID |
| `name` | text | required | 展示姓名 |
| `headline` | text | required | 一句话身份 |
| `avatar_url` | text | nullable | 头像 URL |
| `bio` | text | required | 简介，建议 80 字以内 |
| `tags` | text[] | required | supertags，可含少量自定义标签 |
| `created_at` | timestamp | default now | 创建时间 |
| `updated_at` | timestamp | auto update | 更新时间 |

约束：

- `user_id` 级联删除。
- `tags` 优先使用 `@pair/shared` 中的 `SUPERTAGS`。

### objectives

用户当前目标，1 到 3 个。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 目标 ID |
| `user_id` | uuid | FK users.id | 用户 ID |
| `kind` | ObjectiveKind | required | 目标类型 |
| `side` | ObjectiveSide | required | 互补侧 |
| `created_at` | timestamp | default now | 创建时间 |

索引：

- index: `user_id`
- 建议补充 unique: `(user_id, kind, side)`，避免重复选择同一目标。

### social_links

档案来源链接。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 来源 ID |
| `user_id` | uuid | FK users.id | 用户 ID |
| `platform` | SocialPlatform | required | 来源平台 |
| `url` | text | required | 公开 URL |
| `created_at` | timestamp | default now | 创建时间 |

索引：

- index: `user_id`

### matches

一次人与人之间的推荐关系。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | Match ID |
| `created_at` | timestamp | default now | 创建时间 |
| `user_a_id` | uuid | FK users.id | 当前发起侧或系统生成侧 A |
| `user_b_id` | uuid | FK users.id | 候选侧 B |
| `objective_kind` | ObjectiveKind | required | 命中的目标类型 |
| `score` | float | required | 匹配分，0 到 100 |
| `reason` | text | required | Agent 生成的匹配理由 |
| `state` | MatchStatus | default pending | 当前状态 |

索引：

- index: `user_a_id`
- index: `user_b_id`
- index: `state`
- 建议补充 index: `(user_a_id, state, created_at)`
- 建议补充 unique partial 或业务约束：同一周期内不重复推荐 `(user_a_id, user_b_id, objective_kind)`。

### intros

Agent 为 Match 生成的开场白版本。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 开场白 ID |
| `match_id` | uuid | FK matches.id | Match ID |
| `generated_at` | timestamp | default now | 生成时间 |
| `text` | text | required | 开场白，建议 100 字以内 |
| `variant` | IntroVariant | required | 文案风格 |
| `is_active` | boolean | default true | 是否当前生效 |

索引：

- index: `match_id`

业务规则：

- 用户点击“改写”时新增一条 intro，并将旧 active intro 置为 false。

### dialogues

A2A 会话。Phase 1 中，用户点击 Match Card 的“发出”后直接创建。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 会话 ID |
| `match_id` | uuid | unique, FK matches.id | Match ID |
| `state` | A2ASessionState | default pending | 会话状态 |
| `total_rounds` | int | default 5 | 每方 5 轮，总消息 10 条 |
| `started_at` | timestamp | nullable | 开始时间 |
| `completed_at` | timestamp | nullable | 完成时间 |

约束：

- 一个 Match 只能有一个 A2A session。
- `completed_at` 只有在 `completed` / `failed` / `aborted` 时写入。

### dialogue_messages

A2A 对话消息。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 消息 ID |
| `session_id` | uuid | FK dialogues.id | 会话 ID |
| `round` | int | required | 轮次，1 到 5 |
| `speaker_agent_user_id` | uuid | FK users.id | 发言 Agent 代表的用户 |
| `content` | text | required | 内容，建议 200 字以内 |
| `redacted_spans` | json | default [] | 被脱敏片段 |

索引：

- index: `session_id`
- index: `(session_id, round)`

建议补充字段：

- `source`: `agent_auto | user_takeover | user_edited`，已存在于 shared 类型但当前 Prisma schema 尚未落库。
- `created_at`: timestamp，便于前端 timeline 和排障。
- unique: `(session_id, round, speaker_agent_user_id)`，防止同一方同轮重复写入。

### summaries

A2A 总结卡。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | Summary ID |
| `session_id` | uuid | unique, FK dialogues.id | 会话 ID |
| `your_view_of_them` | text | required | 给当前用户看的对对方总结 |
| `their_view_of_you` | text | required | 对方可能如何看你 |
| `topics` | text[] | required | 3 个建议话题 |
| `alignment_score` | int | required | 对齐度，0 到 10 |
| `score_reason` | text | required | 评分理由 |
| `risk_note` | text | nullable | 风险提示 |
| `generated_at` | timestamp | default now | 生成时间 |

约束：

- `alignment_score` API 层校验为 0 到 10。
- `topics` API 层校验为 3 条。

### meetings

见面记录。Phase 1 只展示入口，不完整落地。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 见面 ID |
| `match_id` | uuid | FK matches.id | Match ID |
| `scheduled_at` | timestamp | required | 约定时间 |
| `meeting_url` | text | required | 会议链接 |
| `state` | MeetingStatus | default scheduled | 状态 |

索引：

- index: `match_id`

### feedback

会后反馈。Phase 2 使用，Phase 1 可保留表结构。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 反馈 ID |
| `meeting_id` | uuid | FK meetings.id | 见面 ID |
| `user_id` | uuid | FK users.id | 提交人 |
| `score` | int | required | 1 到 5 |
| `tags` | text[] | required | 反馈标签 |
| `comment` | text | required | 文字反馈 |
| `submitted_at` | timestamp | default now | 提交时间 |

索引：

- index: `meeting_id`
- index: `user_id`

### public_pages

公开档案页元数据。公开内容来自 `profiles` 的安全投影。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 公开页 ID |
| `user_id` | uuid | unique, FK users.id | 用户 ID |
| `og_image_url` | text | nullable | 分享图 |
| `is_published` | boolean | default false | 是否发布 |
| `created_at` | timestamp | default now | 创建时间 |
| `updated_at` | timestamp | auto update | 更新时间 |

约束：

- URL slug 使用 `users.pair_profile_url`，不在本表重复。

## 5. 建议补充表

当前 Prisma schema 已能支撑核心 Demo。为了完整支撑异步 Agent 与登录，建议后续补充以下表。

### ai_jobs

记录 Profile / Match / Dialogue / Summary 的异步任务。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 任务 ID |
| `user_id` | uuid | nullable, FK users.id | 触发用户 |
| `kind` | enum | required | `profile_generate | match_generate | dialogue_run | summary_generate` |
| `state` | enum | required | `queued | running | succeeded | failed | cancelled` |
| `input` | jsonb | required | 任务输入快照 |
| `output` | jsonb | nullable | 成功输出 |
| `error_code` | text | nullable | 错误码 |
| `error_message` | text | nullable | 错误摘要 |
| `retry_count` | int | default 0 | 重试次数 |
| `created_at` | timestamp | default now | 创建时间 |
| `started_at` | timestamp | nullable | 开始时间 |
| `finished_at` | timestamp | nullable | 完成时间 |

### profile_drafts

Onboarding 抓取和 LLM 解析产生的可编辑草稿，用户确认后写入 `profiles`。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 草稿 ID |
| `user_id` | uuid | FK users.id | 用户 ID |
| `source_url` | text | nullable | 来源 URL |
| `pasted_text` | text | nullable | 用户粘贴文本 |
| `draft` | jsonb | required | ProfileDraft |
| `confidence` | float | required | 0 到 1 |
| `state` | enum | required | `draft | confirmed | discarded` |
| `created_at` | timestamp | default now | 创建时间 |
| `confirmed_at` | timestamp | nullable | 确认时间 |

### refresh_tokens

如果 Web/API 使用 refresh token，应单独落库或存 Redis 黑名单。

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | Token ID |
| `user_id` | uuid | FK users.id | 用户 ID |
| `token_hash` | text | unique | refresh token hash |
| `expires_at` | timestamp | required | 过期时间 |
| `revoked_at` | timestamp | nullable | 吊销时间 |
| `created_at` | timestamp | default now | 创建时间 |

## 6. 核心状态流转

### Match

```text
pending
  ├─ pass -> rejected
  └─ send -> dialogue_running

dialogue_running
  ├─ A2A completed -> dialogue_done
  ├─ user abort -> rejected
  └─ system failed -> pending 或 rejected（按错误类型）

dialogue_done
  ├─ schedule meeting -> scheduled（Phase 2）
  └─ no interest -> done
```

### A2ASession

```text
pending -> running -> completed
pending -> running -> failed
pending -> aborted
running -> aborted
```

### PublicPage

```text
is_published=false：仅本人可预览
is_published=true：任何知道链接的人可访问安全投影
```

## 7. API 返回视图

数据库表不应直接暴露给前端。推荐视图：

- `MeView`: user + profile + objectives + publicPage 状态。
- `MatchCardView`: match + candidate profile + active intro + whyMatch + expiresAt。
- `A2ASessionView`: session + progress + messages + estimatedRemainingSeconds。
- `SummaryCardView`: summary + candidate profile + CTA 状态。
- `PublicProfileView`: slug + safe profile + tags + QR / invite CTA。
