# 小程序后端真机联调开发计划

> 目的：把「让 `apps/miniprogram` 在 `USE_MOCK=false` 下连真实 `apps/api` 跑通
> 完整流程（Login → Onboarding → Today → A2A → Summary）」拆成有序、可验收的步骤。
>
> 本计划只做**打通真机联调**：保留现有确定性 mock AI / A2A 生成；真实 OpenAI、
> 微信 `jscode2session` 登录、BullMQ 异步 worker 列为**范围外/推迟**（见 §3）。
>
> 依据：`apps/api/src` 实际路由与响应，`apps/miniprogram/src/api.ts` 实际调用，
> `apps/api/prisma/schema.prisma`，`apps/api/scripts/verify-flow.mjs`。凡未在源码中
> 确认到的字段/取值，本文标注「以实际响应为准，联调时 curl 对拍」，不臆造。
>
> 最后更新：2026-07-02

---

## 0. 范围与前提

### 0.1 本期目标
小程序切到真实后端后，能完成一次真机流程：登录 → 拉到 Today 的 Match → 发出邀请
启动 A2A → 轮询看到 A2A 消息与进度直到 `completed` → 打开 Summary 决策卡。

### 0.2 关键既有事实（写代码前必读）
- **成功响应包裹**：`apps/api` **没有全局拦截器**，每个 controller 手动 `return { data: ... }`。
  小程序 `request.ts` 已对 `{ data }` 做解包（`resolve(body.data ?? res.data)`），**这一层已对齐**。
- **错误响应**：全局 `HttpExceptionFilter`（`src/main.ts:23`），形状为顶层
  `{ code, message, details? }`，**不包裹 `{ data }`**。状态码→code 映射：401→`UNAUTHORIZED`、
  400→`VALIDATION_ERROR`、404→`NOT_FOUND`、409→`CONFLICT` 等。
- **鉴权**：自研 `JwtAuthGuard`（`src/auth/jwt-auth.guard.ts`），取 `Authorization: Bearer <token>`，
  `request.user = { id: payload.sub }`。除 `POST /auth/*`、`GET /health`、`GET /u/:slug` 外，全部需鉴权。
- **登录即有数据**：`AuthService.mockLogin`（`auth.service.ts:14–132`）会 upsert 当前用户档案，
  并 `ensureDemoNetwork` 造出 `sarah-chen` / `daniel-liu` 两个 demo 用户与**两条 match**
  （score 86、74，各带 active invitation）。所以**登录后 `GET /matches` 直接返回 2 条**，无需 `db:seed`。
- **端口**：`main.ts:25` 读 `PORT ?? 3000`（默认 3000）。`verify-flow.mjs` 默认 `http://127.0.0.1:3000`，
  读环境变量 `PAIR_API_BASE_URL` 覆盖。小程序 `config.ts` 当前 `API_BASE_URL` 指向 `:4000`。
  → 本计划统一用 **`PORT=4000`** 起 API（避开 Web 原型占用的 3000，且与小程序配置一致）。

### 0.3 改动落点
本期改动**集中在小程序适配层** `apps/miniprogram/src/api.ts` 与 `src/config.ts`；后端响应结构
**默认不动**（低风险）。仅当某字段后端根本无法提供、且前端也无法派生时，才在 §4 记为「待确认」
交由负责人决定是否改后端。

---

## 1. 接口盘点（Endpoint Audit）

### 1.1 小程序当前调用的 6 个端点

`apps/miniprogram/src/api.ts` 目前调用下列端点。逐一对应真实路由与响应（`data` 内），并标出差异。

| 小程序调用 | 真实路由 | 请求 | 真实响应（`data` 内） | 差异 / 处理 |
|---|---|---|---|---|
| `login()` | `POST /auth/mock-login` | 当前**无 body** | `{ accessToken, user:{ id, pairProfileUrl, hasProfile } }` | ❌ 字段是 `accessToken` 非 `token`；❌ `MockLoginDto.providerId` 必填（`@IsString @MinLength(3)`）且 `forbidNonWhitelisted` → 无 body 会 400。需补 body 并读 `accessToken`（见 Step 1.1） |
| `fetchMatches()` | `GET /matches` | Bearer | `MatchView[]`：`{ id, createdAt, objectiveKind, score, reason, state, candidate:{ id, pairProfileUrl, profile, objectives[], socialLinks[] }, invitation, session }` | ❌ 与小程序 `MatchView`（`person/whyMatch/intro/topics/expiresInHours`）字段名完全不同，只有 `id/score` 对得上。需映射（见 Step 1.4） |
| `passMatch(id)` | `POST /matches/:id/pass` | Bearer | 完整 match 视图（`state:'rejected'`） | ✅ 小程序声明 `void` 并忽略 body，无害 |
| `sendMatch(id)` | `POST /matches/:id/send` | Bearer | `{ matchId, state:'dialogue_running', sessionId, summaryId:null }` | ✅ `sessionId` 存在，路由对齐；⚠️ 重复发起返回 `409 A2A_ALREADY_STARTED`，`details.sessionId` 可复用（见 Step 1.5） |
| `getA2ASession(id)` | `GET /a2a/:sessionId` | Bearer | `{ id, matchId, state, totalRounds, completedRounds, startedAt, completedAt, candidate:{ id, pairProfileUrl, profile }, messages[], summaryId }` | ❌ 多处字段名/结构不同（见 §1.3），需映射（Step 1.2） |
| `abortA2ASession(id)` | `POST /a2a/:sessionId/abort` | Bearer | 同 `GET /a2a/:sessionId` 的 A2A 会话视图（`state:'aborted'`） | 同 A2A 映射（Step 1.2） |

路由与包裹层对齐良好；**破坏点几乎都在字段级**。

### 1.2 A2A 会话字段对照（重点）

小程序 `A2ASessionView` 期望 vs 真实 `GET /a2a/:sessionId`：

| 小程序期望 | 真实字段 | 处理建议 |
|---|---|---|
| `sessionId` | `id` | 映射 `sessionId ← id` |
| `status`（`running/completed/aborted/failed`） | `state`（`pending/running/completed/aborted/failed`） | 映射 `status ← state`；额外的 `pending` 归一为 `running` |
| `currentRound` | `completedRounds` | 映射 `currentRound ← completedRounds`（或 `+1`，联调时看语义） |
| `totalRounds` | `totalRounds` | 直接用（schema `@default(5)`，实际以会话存储值为准，对拍确认） |
| `progress`（0–100） | **无** | 前端派生：`round/totalRounds*100`（待确认 A，§4） |
| `estimatedSeconds` | **无** | 前端派生：`剩余轮次 * 轮询间隔`（待确认 A，§4） |
| `messages[].speaker`（string） | `messages[].speaker`（**Profile 对象**：`{ name, headline, avatarUrl, bio, tags }`） | 映射 `speaker ← speaker?.name`（`[object Object]` 风险） |
| `messages[].id/content` | 同名 | 直接用 |
| 内嵌 `summary:{ score, oneLine, topics, risk }` | **仅 `summaryId`** | `completed` 后另取 `GET /summaries/:summaryId`（见 Step 1.3） |

> `messages[]` 真实元素：`{ id, round, source:'agent_auto'(硬编码), speakerUserId, speaker:<Profile|null>, content, redactedSpans }`。

### 1.3 Summary 字段对照

小程序 `A2ASummaryView` 期望 vs 真实 `GET /summaries/:summaryId`：

| 小程序期望 | 真实字段 | 处理建议 |
|---|---|---|
| `score`（0–10） | `alignmentScore`（`summaries.service.ts:26` clamp 到 0–10） | 映射 `score ← alignmentScore`，✅ 量纲一致 |
| `topics` | `topics` | 直接用 |
| `risk` | `riskNote` | 映射 `risk ← riskNote` |
| `oneLine` | **无**（有 `scoreReason/yourViewOfThem/theirViewOfYou`） | 前端兜底：用 `scoreReason` 或 `yourViewOfThem` 首句（待确认 B，§4） |

### 1.4 Match 字段对照

小程序 `MatchView`（`person/whyMatch/intro/topics/expiresInHours/score`）vs 真实 `GET /matches` 元素：

| 小程序期望 | 真实来源 | 处理建议 |
|---|---|---|
| `person`（`name/headline/tags/bio/avatarSrc`） | `candidate.profile`（`name, headline, tags[], bio, avatarUrl?`） | 映射 `person ← candidate.profile`；`avatarSrc ← candidate.profile.avatarUrl`，为 `null` 时回退占位图 |
| `whyMatch` | `reason` | 映射 `whyMatch ← reason` |
| `intro`（开场白） | active `invitation.text`（`intros` 表，字段名 **`text`**） | 映射 `intro ← invitation?.text` |
| `score` | `score` | 直接用 |
| `topics` | **match 视图无该字段** | 待确认 C（§4）：前端置空/隐藏，或后端补 |
| `expiresInHours` | **match 视图未返回过期时间** | 待确认 C（§4）：前端隐藏，或后端在 `toView` 补 `expiresAt` |

### 1.5 发起 A2A 的幂等
`POST /matches/:id/send` 若该 match 已发起过，抛 `409 { code:'A2A_ALREADY_STARTED', details:{ sessionId } }`。
`sendMatch` 需捕获 409、从 `error` 的 `details.sessionId` 复用已存在会话；否则也可先 `GET /matches/:id`
读 `session.id` 兜底（`verify-flow.mjs:88–105` 即用 `match.session.id` 兜底）。

### 1.6 完整流程还需、但 `api.ts` 尚未覆盖的端点（补充盘点）
真机跑「完整流程」时，Onboarding 与 Summary 页当前仍走 mock。要端到端接真，需在 `api.ts` 追加：

| 用途 | 真实路由 | 响应要点 |
|---|---|---|
| 生成档案草稿 | `POST /profiles/generate` → 返回 `jobId` | 配 `GET /jobs/:id` 轮询、`GET /profiles/generate/:jobId` 取草稿 |
| 确认档案 | `POST /profiles/confirm-draft`（或 `POST /profiles/me` upsert） | 写入正式档案 |
| 读/存目标 | `GET /objectives` / `PUT /objectives`（别名 `POST /users/me/objectives`） | 1–3 条约束在后端 |
| 打开 Summary | `GET /summaries/:summaryId` | 见 §1.3 |
| 公开档案页 | `GET /u/:slug`（无鉴权） | Web/分享用 |

> 本期主线（Today→A2A→Summary）优先；Onboarding 接真可作为同一 Step 1 的延伸项，按需推进。

---

## 2. 联调步骤（有序）

> 规则：完成一步、跑其「验证」，通过后再进入下一步。

### Step 1 — 对齐类型与响应结构（改 `apps/miniprogram/src/api.ts`）

**Actions**
- 1.1 `login()`：
  - 请求体补必填字段，例如 `{ provider:'email', providerId:'devtools@pair.local', name:'DevTools User' }`
    （对齐 `MockLoginDto`；`forbidNonWhitelisted` 下勿传多余字段）。
  - 读 `res.accessToken`（非 `res.token`）传给 `setToken`。
- 1.2 `getA2ASession()` / `abortA2ASession()`：把真实响应映射为 `A2ASessionView`——
  `sessionId←id`、`status←state`（`pending→running`）、`currentRound←completedRounds`、
  `messages[].speaker←speaker?.name`；`progress`/`estimatedSeconds` 前端派生；
  `state==='completed' && summaryId` 时再取 summary（见 1.3 映射）填充 `summary`。
- 1.3 新增/复用 `getSummary(summaryId)`：映射 `score←alignmentScore`、`risk←riskNote`、
  `oneLine` 兜底、`topics` 直用。
- 1.4 `fetchMatches()`：映射为小程序 `MatchView`——`person←candidate.profile`、
  `whyMatch←reason`、`intro←invitation?.text`、`avatarSrc←candidate.profile.avatarUrl||占位`；
  `topics/expiresInHours` 按 §4-C 处理。
- 1.5 `sendMatch()`：捕获 `409 A2A_ALREADY_STARTED`，复用 `error.details.sessionId`。
- （可选）1.6 追加 §1.6 的 onboarding/summary 端点映射函数。
- 约束：映射集中在 `api.ts`，页面与 `A2ASessionView/MatchView/DialogueMessageView` 结构尽量不动。

**验证**
- `pnpm --filter @pair/miniprogram typecheck` 通过。
- 对每个端点用 `curl` 拿到真实响应，逐字段核对映射（尤其 A2A `messages[].speaker`、
  `state` 取值、`totalRounds` 实际值）。

### Step 2 — 本地起服务

**Actions**
- `docker compose up -d`（`pair-postgres:5432`、`pair-redis:6379`）。
- 准备 `apps/api/.env`（照 `apps/api/.env.example`：`DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、
  `CORS_ORIGINS`、`PORT` 等；本期不需要真实 `OPENAI_API_KEY` / 微信密钥）。
- `pnpm --filter @pair/api prisma:generate` 与 `pnpm --filter @pair/api prisma:migrate`。
- 起服务：`PORT=4000 pnpm --filter @pair/api start:dev`。
- `db:seed` 可选（登录已造 demo network + 2 matches；seed 只是扩充候选池）。

**验证**
- `curl -i http://127.0.0.1:4000/health` → `200`。
- `curl -s -XPOST http://127.0.0.1:4000/auth/mock-login -H 'content-type: application/json'
  -d '{"provider":"email","providerId":"devtools@pair.local","name":"DevTools User"}'`
  → 返回 `{ data:{ accessToken, ... } }`。
- 用该 `accessToken`：`curl -s http://127.0.0.1:4000/matches -H "authorization: Bearer <token>"`
  → 返回 2 条 match。

### Step 3 — 配置（让小程序连真实后端）

**Actions**
- `apps/miniprogram/src/config.ts`：`USE_MOCK = false`；`API_BASE_URL = 'http://127.0.0.1:4000'`（与 API 端口一致）。
- 后端 `CORS_ORIGINS`：本期主要用 WeChat DevTools 联调；真机 `wx.request` 无浏览器 `Origin`，
  CORS 影响小，但仍建议在 `.env` 配置允许来源或留空（`origin:true` 反射）。
- JWT 注入：确认 `request.ts` 从 storage 取 token 并加 `Authorization: Bearer`，401 时清 token 跳登录。
- 真机域名白名单：真机需在小程序后台把 API 域名加入 **request 合法域名**；DevTools 可在
  「本地设置」勾选「不校验合法域名」以便本地 `127.0.0.1:4000` 联调。

**验证**
- DevTools 打开项目，`USE_MOCK=false` 下进入 Today，Network 面板可见请求命中 `127.0.0.1:4000`，
  返回真实数据；手动使 token 失效可见 401 → 清 token → 回登录。

### Step 4 — 端到端验证

**Actions**
- 后端流：`PAIR_API_BASE_URL=http://127.0.0.1:4000 pnpm --filter @pair/api verify:flow`
  （覆盖 health → mock-login → wechat-login → me → profile generate/job/draft/confirm →
  matches → send → 轮询 A2A 到 `completed` → summary → `/u/:slug`）。
- 小程序真机/DevTools 走查：Login → Today（看到 2 条 match）→ 发出 → A2A（消息增量、进度、
  到 `completed`）→ Summary（分数、话题、风险）。
- 回归：根 `pnpm typecheck` 全绿。

**验证**
- `verify:flow` 退出码 0，打印出 `alignmentScore`、`a2a.messages.length`、`summaryId` 等。
- 小程序完整流程无卡死、无 `[object Object]`、无字段空白；A2A 轮询在 `completed`/`aborted` 后停止。
- 每步「验证」逐条勾选，结果写入 `memory-bank/progress.md`。

**Stop condition**：任一验证失败则停在当前步修复，不带已知破坏进入下一步。

---

## 3. 范围外 / 推迟项（本期明确不做）

- **真实 OpenAI**：保留确定性 mock `AiService.generateProfileDraft` 与同步 mock A2A 生成
  （`dialogue-runner`）。不接 `OPENAI_API_KEY`。
- **微信 `jscode2session` 真实登录**：现有 `POST /auth/wechat-login` 为 mock adapter；
  本期小程序登录走 `POST /auth/mock-login` 打通即可。
- **BullMQ 异步 worker**：现状是 `send` 后同步生成 A2A/Summary，保持不变；不引入队列/轮询 worker。
- **Match Agent 真实打分 / Summary Agent 真实生成**：沿用既有 mock 逻辑。

以上均在后续阶段（对应 `implementation.md` §6/§7/§8/§15.2）再做。

---

## 4. 待确认清单（需负责人拍板「改后端还是改小程序」）

> 统一原则建议：**优先改小程序适配层，后端响应保持不动**（低风险）。以下逐项给建议但不擅自定。

- **A｜A2A 的 `progress` / `estimatedSeconds`**：后端不返回。
  建议前端派生（`completedRounds/totalRounds` 与剩余轮次×轮询间隔）。
  待确认：是否改由后端在 `GET /a2a/:sessionId` 直接返回。
- **B｜Summary 的 `oneLine`**：后端无该字段。
  建议前端用 `scoreReason` 或 `yourViewOfThem` 首句兜底。
  待确认：是否让 Summary Agent/接口输出一句话结论。
- **C｜Match 的 `topics` / `expiresInHours`**：`GET /matches` 视图不含这两者
  （`topics` 来自 A2A 后的 summary；match 视图也未返回过期时间）。
  建议前端隐藏或置空。待确认：是否在 `matches.service.ts` 的 `toView` 补 `expiresAt`（Match 模型是否有该列需先确认）与话题。
- **D｜A2A `messages[].speaker`**：后端返回 Profile 对象，前端期望字符串。
  建议前端取 `speaker?.name`。待确认：是否让后端直接返回 speaker 显示名。

> 上述任一项若最终决定「改后端」，属于后端改动，超出本期「只改适配层」的默认范围，需单独排期并更新 `decisions.md`。

---

## 5. 验收对照（对应本计划完成判据）

- [x] §1 接口盘点：6 个端点 × 真实路由/请求/响应 + 差异（含 `{ data }` 包裹、summary 0–10、
      A2A `state/completedRounds/messages/summaryId` 结构）。
- [x] §2 有序步骤：对齐结构 → 起服务 → 配置 → 端到端验证。
- [x] 每步「验证」小节（可跑命令 / 可观察结果）。
- [x] §3 范围外/推迟项（OpenAI、微信登录、BullMQ）。
