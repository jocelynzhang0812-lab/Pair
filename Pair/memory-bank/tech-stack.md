# Pair 技术栈推荐

> 基于 `memory-bank/design-document.md`（v0.1.1）推导，目标：**微信小程序为主 + 独立 web 公开档案页（pair.app/u/xxx）**
> 选择原则：克制、稳定、可控、能跑出 Demo，避免过度工程。

---

## 1. 总体架构

```
┌─────────────────────────────────────────────────────────┐
│  微信小程序（主载体）                                       │
│  · Today / Onboarding / A2A Dialogue / A2A Summary       │
│  · 我的 Connections / Settings / 反馈卡                    │
├─────────────────────────────────────────────────────────┤
│  Web 公开档案页（H5，pair.app/u/xxx）                       │
│  · 可被分享、可被搜索引擎索引、引导回小程序                  │
├─────────────────────────────────────────────────────────┤
│  BFF / API 服务                                            │
│  · 用户、档案、匹配、A2A、邀约、授权                         │
├─────────────────────────────────────────────────────────┤
│  AI 服务层                                                 │
│  · 档案解析 / 标签抽取 / Agent 对话 / 开场白生成             │
├─────────────────────────────────────────────────────────┤
│  数据层                                                    │
│  · 关系型数据库 + 缓存 + 对象存储 + 任务队列                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 小程序端

### 推荐：微信原生小程序 + TypeScript

| 层级 | 选型 | 理由 |
|---|---|---|
| 框架 | **原生微信小程序 + TS** | 包体最小、启动最快、对自定义导航 / 分享 / 安全区适配最可控。Demo 阶段不需要跨端包袱。 |
| 状态管理 | **MobX / 轻量 Store** 或 **原生 Behavior** | MobX 在小程序成熟且轻量；若项目简单可用 Behavior 自己拼。避免 Redux 的样板代码。 |
| 网络 | 原生 `wx.request` 封装 + 自动重试 / Token 注入 | 足够，A2A 用轮询（1–2s）或 SSE 短连。 |
| 构建工具 | **微信开发者工具** + `miniprogram-ci` | 官方 CI 上传、预览、SourceMap。 |
| 包体积优化 | `gulp` / 脚本做 SVG 压缩、CSS 抽离、字体子集 | 主包控制在 1.5 MB 以内。 |

### 为什么不用 Taro / uni-app？

- 跨端优势对 Pair 当前阶段无用（只有一个主战场：微信小程序）。
- 会引入额外运行时、包体积变大、样式行为偶发不一致。
- 公开档案页是独立 H5，完全可用 Next.js 做，没必要用跨端框架统一。

### 小程序分包建议

```
app.json
├── pages/app/*          # 主包：Today / Onboarding / Settings
├── pages/a2a/*          # 分包：A2A Dialogue / Summary
├── pages/public/*       # 分包：公开档案小程序内预览
└── pages/people/*       # 分包：Connections / Drawer
```

---

## 3. Web 公开档案页

### 推荐：Next.js 14 (App Router) + React + TypeScript

| 项 | 选型 | 理由 |
|---|---|---|
| 框架 | **Next.js 14 App Router** | SSR/SSG 可选、OG Image 动态生成、SEO 友好、Vercel 一键部署。 |
| 样式 | **CSS Modules** 或 **Tailwind + 自定义 token** | 设计文档已定义完整 design token；若用 Tailwind 必须全部覆写成 Pair token，不能直接用默认色板。 |
| 字体 | Google Fonts / 自托管子集 | Fraunces 必须子集化；中文衬线用系统 fallback 优先。 |
| 部署 | **Vercel** | 域名 `pair.app` 可接 Vercel；Edge Function 做动态 OG。 |
| 动画 | **Framer Motion** | 公开页卡片入场、呼吸 dots 等微动效。 |

### OG Image 动态生成

- 用 `@vercel/og`（基于 Satori）把公开档案卡片渲染成 PNG。
- 分享时自动带 `?utm=wechat_share` 等参数。

---

## 4. 后端服务（BFF + API）

### 推荐：Node.js + NestJS 或 Python + FastAPI

| 方案 | 适合场景 | 推荐度 |
|---|---|---|
| **Node.js + NestJS + TypeScript** | 团队前端背景强、想统一 TS 全栈、长期可维护 | ⭐ 首选 |
| **Python + FastAPI + SQLAlchemy** | AI 团队主导、LLM 调用链路多、快速迭代 | 备选 |

### 推荐结构（以 NestJS 为例）

```
api/
├── src/
│   ├── auth/              # wx.login / openid / JWT
│   ├── users/             # 用户、objectives
│   ├── profiles/          # 档案 CRUD、v0 自动生成
│   ├── matches/           # 匹配、待审、Pass
│   ├── a2a/               # A2A 会话、轮次、结果
│   ├── invitations/       # 邀约、接受、时间协商
│   ├── public/            # 公开档案 API
│   └── jobs/              # 异步抓取 / LLM 任务
```

### 核心依赖

- **HTTP 框架**：NestJS（Express/Fastify 底层）
- **ORM**：**Prisma**（类型安全、迁移好、PostgreSQL 友好）
- **验证**：`class-validator` + `class-transformer`
- **配置**：`@nestjs/config` + `.env`
- **日志**：Pino
- **健康检查**：`@nestjs/terminus`

---

## 5. 数据库与缓存

### 推荐：PostgreSQL + Redis

| 用途 | 选型 | 说明 |
|---|---|---|
| 主数据库 | **PostgreSQL 15+** | 关系型、JSONB 存动态标签 / A2A 对话、全文检索扩展。 |
| 缓存 / 会话 | **Redis** | JWT 黑名单、A2A 轮询状态、限流、排行榜。 |
| 任务队列 | **BullMQ（Redis）** | Agent 抓取、LLM 调用、邮件/通知异步化。 |
| 搜索（未来） | **PostgreSQL pgvector / Meilisearch** | 初期 pgvector 足够做标签相似度；用户量大再补 Meilisearch。 |

### 关键表（早期）

```
users
profiles
objectives
matches
a2a_sessions
a2a_messages
invitations
feedback_cards
public_pages
social_links
```

---

## 6. AI / LLM 层

### 推荐：OpenAI API（GPT-4o-mini / GPT-4o）+ 自研 Prompt 编排

| 功能 | 模型建议 | 说明 |
|---|---|---|
| 档案解析 / 标签抽取 | **GPT-4o-mini** | 成本低、速度ok、输出结构化 JSON。 |
| A2A Agent 对话 | **GPT-4o** | 需要一定推理深度，控制轮次（5–8 轮）。 |
| 开场白生成 | **GPT-4o-mini** | 短文本、低成本。 |
| 对齐度打分 | **GPT-4o-mini** | 输出 1–10 整数 + 一句话理由。 |

### 工程化

- **Prompt 管理**：用 TypeScript 模板字符串 + 版本控制；不要硬编码在业务代码里。
- **结构化输出**：强制 `response_format: { type: "json_object" }` 或 Function Calling。
- **Token / 成本监控**：接入 Helicone 或自研中间件记录每次调用。
- **异步化**：所有 LLM 调用走 BullMQ，避免阻塞 HTTP。

### 档案抓取

- 输入：LinkedIn / 小红书 / 个人站 URL。
- 实现：先走 **Jina AI Reader / Firecrawl** 获取正文，再喂给 LLM 抽取。
- 小红书/LinkedIn 反爬：前期可引导用户粘贴文本或授权公开主页，必要时用浏览器插件/无头浏览器兜底。

---

## 7. 认证与安全

| 场景 | 方案 |
|---|---|
| 小程序登录 | `wx.login` 拿 `code` → 后端换 `openid` / `unionid` → 签发 JWT |
| Web 登录 | 同小程序账号体系，扫码小程序码登录或手机号 |
| 授权 | `getUserProfile` 按钮触发，用户主动授权头像昵称 |
| API 鉴权 | JWT（access token 短效 + refresh token） |
| 敏感接口限流 | Redis + `@nestjs/throttler` |
| HTTPS | 全站 TLS 1.2+ |

---

## 8. 实时 A2A 预览

设计文档明确：**小程序不能用 WebSocket，改用轮询或 SSE 短连。**

### 推荐：短轮询 1.5s（MVP 阶段）

- 客户端每 1.5s 请求 `/a2a/:id/status`。
- 服务端返回当前轮次、最新 messages、estimatedSeconds。
- 简单、可控、无长连接兼容问题。

### 进阶：SSE（Server-Sent Events）

- 若后端用 Fastify / 支持流式响应，可让 A2A 逐条推送。
- 小程序 `wx.request` 支持流式读取，但实现复杂度高于轮询；Demo 阶段不建议。

---

## 9. 设计系统落地

### 推荐：Token 优先 + 原子化 CSS 变量

小程序和 Web 共用同一套 token 定义：

```ts
// shared/tokens.ts
export const tokens = {
  color: {
    bgBase: '#F7F5F0',
    bgRaised: '#FFFFFF',
    fgPrimary: '#141210',
    accent: '#B68559',
    accentDark: '#7F5C3B',
    accentSoft: '#F2E9DC',
  },
  radius: { card: 18, button: 12, chip: 14, fab: '50%' },
  duration: { fast: 120, base: 240, slow: 360 },
  // ...
};
```

- 小程序：生成 `tokens.wxss`。
- Web：生成 CSS 变量或 Tailwind theme extend。

### 字体

| 字体 | 加载方式 | 说明 |
|---|---|---|
| **Fraunces** | 子集化 WOFF2，内联/CDN | 仅数字 + 英文，体积小。 |
| **中文衬线** | 系统字体 fallback | 思源宋体虽好但文件大，Demo 用系统宋体（STSongti-SC 等）fallback。 |
| **Inter / PingFang** | 系统自带 | 无衬线正文，不需要额外加载。 |
| **JetBrains Mono** | CDN | supertag # 前缀，可延迟加载。 |

### 插画

- 格式：**SVG（内联）**，单色 1.5px 描边 + 可控 accent 色块。
- 工具：Figma / Illustrator 导出 SVG → SVGO 压缩 → 组件化。
- 动画：SVG + CSS keyframe（呼吸、扫描线），不用复杂 SMIL。

---

## 10. 部署与 DevOps

| 层 | 推荐 | 说明 |
|---|---|---|
| 小程序 | 微信开发者工具 CI / `miniprogram-ci` | GitHub Actions 触发预览版 / 体验版上传。 |
| Web | **Vercel** | 自动分支预览、Edge、Serverless Function。 |
| API | **Railway / Render / 阿里云 ECS** | 早期 Railway/Render 快；国内正式服务用阿里云/腾讯云。 |
| 数据库 | **Supabase / Railway PostgreSQL / 阿里云 RDS** | 先选托管，降低运维。 |
| 域名 | `pair.app` | Web + API 共用主域名；小程序 API 可用 `api.pair.app`。 |
| CI/CD | **GitHub Actions** | lint、type-check、build、上传小程序、部署 Web/API。 |

---

## 11. 第三方服务（可选但推荐）

| 用途 | 服务 | 说明 |
|---|---|---|
| 网页抓取 | **Jina AI Reader** / **Firecrawl** | 把任意 URL 转成干净 Markdown。 |
| 监控 | **Sentry** | 小程序 + Web + API 错误追踪。 |
| 日志 | **Logtail / Datadog** | 可暂缓，Pino 写文件足够。 |
| 推送 | 微信订阅消息 / 服务通知 | 小程序内提醒匹配、A2A 完成。 |
| 图片压缩 / CDN | **腾讯云 COS / Cloudflare R2** | 头像、OG 图。 |
| LLM 可观测 | **Helicone** | 记录 prompt / cost / latency。 |

---

## 12. 技术栈总览

```markdown
| 领域 | 推荐 | 备选 |
|---|---|---|
| 小程序 | 微信原生 + TypeScript | Taro 3 / uni-app |
| Web 公开页 | Next.js 14 App Router + React + TS | Nuxt 3 / Astro |
| 后端 | NestJS + Node.js + TS | FastAPI + Python |
| ORM | Prisma | Drizzle / TypeORM |
| 数据库 | PostgreSQL | MySQL |
| 缓存 / 队列 | Redis + BullMQ | RabbitMQ |
| LLM | OpenAI GPT-4o / GPT-4o-mini | Claude / 文心 / Kimi |
| 网页抓取 | Jina AI Reader / Firecrawl | 自研 Puppeteer |
| 部署 Web | Vercel | Netlify / Cloudflare Pages |
| 部署 API | Railway / Render / 阿里云 ECS | AWS ECS |
| 监控 | Sentry | Bugsnag |
| CI/CD | GitHub Actions | GitLab CI |
| 插画 | SVG + CSS animation | Lottie（慎用，包体大） |
```

---

## 13. 风险与建议

1. **中文衬线字体文件大**：MVP 用系统字体 fallback，真上线后再评估思源宋体子集化。
2. **小程序包体积**：SVG 必须压缩，Fraunces 子集化，图片走 CDN，否则易触 2 MB 主包上限。
3. **LLM 成本高**：A2A 对话轮次、匹配人数、档案解析都要限流和异步队列，防止费用爆炸。
4. **公开档案合规**：不暴露邮箱/电话；OG 图生成注意隐私脱敏。
5. **A2A 轮询成本**：1.5s 轮询对后端 QPS 压力小，但若用户同时开很多预览，建议用 SSE 短连升级。

---

## 14. 下一步可执行的选型确认

- [ ] 确认后端语言：Node/NestJS vs Python/FastAPI
- [ ] 确认数据库托管商：Supabase / Railway / 阿里云 RDS
- [ ] 确认 LLM 供应商与模型版本
- [ ] 确认网页抓取方案：Jina AI Reader 试用
- [ ] 创建 `shared/tokens.ts` 并同步到小程序 wxss 和 web CSS 变量
