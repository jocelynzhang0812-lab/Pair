# Pair · AGENTS.md

> 本文档面向 AI coding agent。当前仓库为 Pair 项目的**规划与文档仓库**，尚未包含可执行代码、构建配置或测试套件。以下内容均基于现有文档如实整理，未做假设。

---

## 1. 项目概述

**Pair** 是一个 Agent-to-Agent（A2A）职场连接平台，定位是"让 AI 替职场人和对的人破冰"，最终促成真人 1:1 coffee chat 或线下见面。

- **产品形态**：微信小程序为主 + 独立 Web 公开档案页（`pair.app/u/{slug}`）。
- **核心流程**：注册建档 → Match Card 双向撮合 → 双方 Agent 5 轮对话（A2A Dialogue）→ A2A Summary Card → 用户决定是否见面 → 排期 → 见面反馈。
- **核心差异**：不是"AI 推荐人"，而是"AI 代表你去和对方 AI 谈"；Agent 是同事，不是 chatbot 或情感陪伴。
- **当前阶段**：规划/设计阶段。仓库内只有产品、设计、技术、PRD、竞品分析等 Markdown 文档，没有实际代码。

### 关键文档

| 文件 | 内容 |
|---|---|
| `memory-bank/design-document.md` | 产品设计文档 v0.1.1：设计哲学、视觉系统、微信小程序约束、核心屏 UI Spec、组件 Spec、Sprint 计划 |
| `memory-bank/tech-stack.md` | 技术栈推荐：架构分层、小程序/Web/后端/数据库/AI/部署/第三方服务 |
| `Pair-PRD-前三期.md` | 前三期 PRD v0.2：Phase 1–3 功能、A2A v1 详细 spec、数据模型、闸门指标 |
| `Pair-竞品分析与差异化定位.md` | 竞品分析与差异化定位 v0.1 |
| `Pair-设计原则.md` | 设计原则 v0.1：视觉/交互基线、Tana/Claude.com/Things 3 借鉴点 |
| `Pair-Memo-OnePage.md` | 项目 OnePage Memo v0.4：小红书 OPC 版 + 12 个月 Roadmap |

---

## 2. 仓库现状

- **没有代码文件**：仓库根目录及以下只有上述 6 个 Markdown 文件，无源码目录。
- **没有包管理文件**：不存在 `package.json`、`pyproject.toml`、`Cargo.toml`、`requirements.txt`、`pnpm-lock.yaml`、`yarn.lock` 等。
- **没有构建/测试配置**：不存在 CI/CD 配置、Dockerfile、Makefile、`.github/workflows`、lint 配置等。
- **没有已初始化的项目框架**：小程序、Web、后端均未初始化。

> 若你接到在此仓库写代码的任务，通常需要先确认：是要继续作为纯文档仓库维护，还是要将其扩展为包含实际代码的 monorepo？

---

## 3. 技术栈（已规划，未落地）

`memory-bank/tech-stack.md` 与 `Pair-PRD-前三期.md` 中推荐/规划的技术选型如下：

| 领域 | 推荐方案 | 备注 |
|---|---|---|
| 微信小程序 | 微信原生 + TypeScript | 主载体；状态管理可用 MobX 或原生 Behavior |
| Web 公开档案页 | Next.js 14 (App Router) + React + TypeScript | Vercel 部署；动态 OG Image（`@vercel/og`） |
| 后端 | NestJS + Node.js + TypeScript（首选）或 FastAPI + Python | BFF + API 服务 |
| ORM | Prisma | PostgreSQL 友好 |
| 数据库 | PostgreSQL 15+ | 主库；JSONB 存动态标签、A2A 对话 |
| 缓存 / 队列 | Redis + BullMQ | 会话、限流、异步 LLM 任务 |
| LLM | OpenAI GPT-4o / GPT-4o-mini | 档案解析、A2A 对话、Summary、开场白 |
| 网页抓取 | Jina AI Reader / Firecrawl | 把公开 URL 转 Markdown 再喂 LLM |
| 部署 Web | Vercel | 域名 `pair.app` |
| 部署 API | Railway / Render / 阿里云 ECS | 早期选托管 |
| 监控 | Sentry | 小程序 + Web + API |
| CI/CD | GitHub Actions | lint、type-check、build、小程序上传 |
| 插画 | SVG + CSS animation | 单色 1.5px 描边，避免 Lottie |

### 数据库关键表（Phase 1 规划）

`users`、`profiles`、`objectives`、`matches`、`intros`、`dialogues`、`dialogue_messages`、`summaries`、`meetings`、`feedback`、`public_pages`、`social_links`。

---

## 4. 代码组织（尚未形成）

目前无代码目录。若后续按 `memory-bank/tech-stack.md` 落地，建议结构如下：

```
/
├── docs/                          # 现有文档可迁移至此
├── miniprogram/                   # 微信小程序
│   ├── app.json / app.ts / app.wxss
│   ├── pages/
│   │   ├── app/                   # 主包：Today / Onboarding / Settings
│   │   ├── a2a/                   # 分包：A2A Dialogue / Summary
│   │   ├── public/                # 分包：公开档案小程序内预览
│   │   └── people/                # 分包：Connections / Drawer
│   ├── components/
│   ├── utils/
│   └── tokens.wxss                # 由 shared/tokens.ts 生成
├── web/                           # Next.js 公开档案页
│   ├── app/
│   ├── components/
│   └── styles/
├── api/                           # NestJS 后端
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── profiles/
│   │   ├── matches/
│   │   ├── a2a/
│   │   ├── invitations/
│   │   ├── public/
│   │   └── jobs/
│   └── prisma/
├── shared/                        # 跨端共享
│   └── tokens.ts                  # color / space / radius / duration
└── .github/workflows/             # CI/CD
```

> 注意：以上仅为规划建议，实际目录结构需团队落地时确定。

---

## 5. 设计系统要点

若你开始写 UI 代码，必须严格遵守现有设计文档，不能复用 Tailwind 默认色板。

### 5.1 核心色彩 Token（`memory-bank/design-document.md` v0.1.1 为准）

| Token | Hex | 用途 |
|---|---|---|
| `--bg-base` | `#F7F5F0` | 全局背景（米白纸感） |
| `--bg-raised` | `#FFFFFF` | 卡片背景 |
| `--bg-sunken` | `#EFECE5` | 输入框 / 二级容器 |
| `--fg-primary` | `#141210` | 正文 / 主标题（近黑） |
| `--fg-secondary` | `#6B655E` | 次要文字 |
| `--border-subtle` | `#EAE6DD` | 默认边框 |
| `--accent` | `#B68559` | Agent 头像点 / focus ring / 进度条 |
| `--accent-dark` | `#7F5C3B` | hover / pressed |
| `--accent-soft` | `#F2E9DC` | Agent 起草微底 / 选中态 |

### 5.2 字体

- 英文/数字衬线：`Fraunces`（子集化 WOFF2）。
- 中文衬线：系统字体 fallback（`Source Han Serif SC`、`STSongti-SC` 等），MVP 不强加外部字体。
- 正文无衬线：`Inter` / `-apple-system` / `PingFang SC`。
- Mono：`JetBrains Mono`（用于 supertag 的 `#` 前缀、时间、命令）。

### 5.3 字体使用铁律

- **Agent 说话永远用衬线，用户说话永远用无衬线**。
- 中文 Hero 必须粗体衬线。
- 不用 9–10px 字体。

### 5.4 圆角

- 卡片：18px
- 按钮 / 输入框：12px
- Chip / Supertag：14px（pill）
- FAB / Agent 头像：50%

### 5.5 动效

- 卡片入场：opacity 0→1 + translateY(12px→0)，240ms，`cubic-bezier(0.16, 1, 0.3, 1)`。
- Agent thinking：14px 圆点，外发光 4px `--accent-glow`，1.4s 呼吸。
- 禁 parallax、scroll-jacking、hover scale、spinner。

### 5.6 Agent 视觉

- 仅用一个 14×14px 渐变圆点，linear-gradient(135deg, `--accent` → `--accent-dark`)。
- **禁用**拟人头像、机器人 emoji、Memoji、3D/等距插画、Notion AI 星星渐变紫。

---

## 6. 构建与测试命令

**当前仓库没有任何构建或测试命令。**

后续若初始化代码，建议按技术栈补充：

- 小程序：`npm run dev:weapp`（或微信开发者工具打开）。
- Web：`pnpm dev` / `pnpm build` / `pnpm start`。
- 后端：`pnpm start:dev` / `pnpm build` / `pnpm test`。
- CI：`pnpm lint` / `pnpm type-check` / `pnpm test`。

---

## 7. 代码风格指南

当前无代码，但文档中已明确的工程约定：

- **Token 优先**：所有颜色、间距、圆角、时长必须走 token，禁止硬编码 hex。
- **TypeScript**：小程序、Web、后端均使用 TypeScript。
- **组件化**：先落地 4 个底层组件：Card / Button / Chip / Composer，再拼 Today 流、Drawer、Onboarding。
- **异步优先**：Match、A2A、档案抓取全部异步，走队列 + 轮询/推送，禁止同步阻塞 HTTP。
- **Prompt 版本化**：LLM prompt 用 TypeScript 模板字符串 + git 版本控制，不要硬编码在业务代码中。
- **结构化输出**：LLM 强制 `response_format: { type: "json_object" }` 或 Function Calling。
- **A11y**：所有交互元素可键盘到达，icon-only 按钮必须有 `aria-label`。

---

## 8. 测试策略

**当前无测试。** 文档中未明确测试框架，建议落地后采用：

- 单元测试：Jest（Node 后端）/ Vitest（Web）。
- 组件测试：Storybook + React Testing Library（Web）。
- E2E：小程序用微信开发者工具真机调试；Web 用 Playwright。
- LLM 输出：对 A2A Summary、开场白、标签抽取做结构化 schema 校验 + 回归用例。

---

## 9. 安全与合规

`Pair-PRD-前三期.md` 与 `Pair-Memo-OnePage.md` 中强调：

- **用户授权一律 opt-in**：抓取公开数据前必须获得用户授权。
- **公开档案脱敏**：不暴露手机号、邮箱、实时位置。
- **A2A 基础 redact**：正则匹配手机号、邮箱、身份证号，替换为 `[联系方式已屏蔽]`；Phase 2 升级 LLM 语义 redact。
- **JWT 鉴权**：access token 短效 + refresh token，Redis 管理黑名单。
- **限流**：敏感接口用 Redis + `@nestjs/throttler`。
- **HTTPS**：全站 TLS 1.2+。
- **训练数据 opt-out**：A2A 对话用于模型训练必须可关闭。
- **未成年保护**：合规框架复用小红书既有流程。

---

## 10. 部署流程

**当前无部署流程。** 规划中的部署链路：

- 小程序：微信开发者工具 CI / `miniprogram-ci`，GitHub Actions 触发预览版/体验版上传。
- Web：Vercel 自动分支预览 + 生产部署。
- API：Railway / Render / 阿里云 ECS。
- 数据库：托管 PostgreSQL（Supabase / Railway / 阿里云 RDS）。
- 域名：`pair.app`（Web），`api.pair.app`（API）。

---

## 11. 给 Agent 的实用提示

1. **不要假设已有代码**：本仓库是文档仓库，做任何代码改动前请先确认是否需要初始化项目。
2. **设计文档优先**：所有 UI/UX 决策以 `memory-bank/design-document.md` 和 `Pair-设计原则.md` 为准；技术决策以 `memory-bank/tech-stack.md` 和 `Pair-PRD-前三期.md` 为准。
3. **中文优先**：项目文档与产品文案主要使用中文；对外公开档案页可同时支持英文。
4. **避免过度工程**：文档反复强调"克制、稳定、可控、跑出 Demo"，Phase 1 不要引入跨端框架、复杂动画、暗色模式、多人 A2A 等。
5. **A2A 是核心**：Phase 1 必须把 A2A Dialogue + Summary Card 做上线，不能拖到 Phase 2。
6. **不要引入小红书 OAuth**：PRD v0.2 已明确删除小红书 OAuth，注册方式为 email / 微信 / Google 三选一。

---

*最后更新：2026-06-30 · 基于仓库内 6 份文档整理*
