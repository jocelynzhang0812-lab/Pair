# Pair 实施计划

> 面向 AI coding agent 的分步执行指令。
> 输入：`memory-bank/design-document.md` v0.1.1、`memory-bank/tech-stack.md`。
> 原则：每一步必须小而具体、可验证、有止血回退方案；本文件严禁包含任何代码。

---

## 0. 执行前必读

### 0.1 当前仓库状态

- 本仓库目前只有 6 份 Markdown 文档，没有代码、没有构建配置、没有测试。
- 不要假设任何框架已初始化。
- 所有技术决策以 `memory-bank/tech-stack.md` 为准，所有 UI/UX 决策以 `memory-bank/design-document.md` 为准。

### 0.2 全局约束

- **主载体**：微信小程序（微信原生 + TypeScript）。
- **Web 页**：Next.js 14 App Router（公开档案页 `pair.app/u/{slug}`）。
- **后端**：NestJS + Node.js + TypeScript。
- **数据库**：PostgreSQL + Prisma；缓存/队列：Redis + BullMQ。
- **LLM**：OpenAI GPT-4o / GPT-4o-mini。
- **设计系统**：必须走 token，禁止硬编码；中文 Hero 粗衬线、Agent 仅 14px 渐变圆点、主按钮近黑底白字。
- **A2A 实时**：小程序端禁用 WebSocket，用短轮询（1.5s）。

### 0.3 每条指令的格式

每条指令包含四部分：

1. **目标**：本步骤要达成什么。
2. **动作**：具体做什么，禁止包含代码。
3. **验证**：如何确认本步骤正确完成。
4. **止血**：如果验证失败，应如何回退或停止。

---

## Phase 1 · 前置确认与仓库初始化

### 步骤 P1-01：确认技术选型与依赖版本

**目标**：在执行任何初始化前，把 `memory-bank/tech-stack.md` 中所有"待确认"项锁死，避免中途改技术栈导致返工。

**动作**：

- 打开 `memory-bank/tech-stack.md` 第 14 节"下一步可执行的选型确认"。
- 在仓库根目录创建 `decisions.md`，逐条记录以下最终决策：
  - 后端语言与框架版本（Node.js + NestJS 具体版本）。
  - 数据库托管商与连接方式。
  - LLM 供应商、模型版本、调用区域/代理方案。
  - 网页抓取服务（Jina AI Reader 或 Firecrawl）及备用方案。
  - 包管理器（pnpm / npm / yarn）及 monorepo 工具（pnpm workspace / Turborepo / 无）。
- 所有决策必须写明理由，且只能二选一，不能写"视情况而定"。

**验证**：

- `decisions.md` 存在且包含上述 5 项决策。
- 每一项都有明确选型与理由。
- 团队负责人或被指派人已审阅并同意（如无法确认，停止后续步骤）。

**止血**：

- 若任何一项无法确定，立即停止所有代码初始化，仅保留本文件与 `decisions.md`。
- 不要先用默认选型继续，等确认后再推进。

---

### 步骤 P1-02：创建 monorepo 目录结构

**目标**：把仓库从纯文档仓库扩展为可执行的 monorepo，但本步骤只创建空目录和基础元数据文件。

**动作**：

- 在根目录创建以下空目录（不包含任何源码）：
  - `apps/miniprogram`：微信小程序。
  - `apps/web`：Next.js 公开档案页。
  - `apps/api`：NestJS 后端。
  - `packages/shared`：跨端共享 token、类型、工具。
  - `docs`：把现有 6 份 Markdown 文档移入此处。
  - `.github/workflows`：CI/CD 占位。
- 根据 `decisions.md` 选择的包管理器，创建对应的工作区配置文件（例如 pnpm-workspace.yaml 或 package.json workspaces 字段），只声明目录，不写依赖。
- 在根目录创建 `README.md`，说明项目结构、如何进入各子应用、本实施计划的入口。

**验证**：

- 运行 `ls` 或文件树检查，确认上述目录存在。
- 工作区配置文件语法正确，能被包管理器识别（例如 pnpm 能列出 workspace packages）。
- 原 6 份文档已移入 `docs/` 且没有重复副本留在根目录。

**止血**：

- 如果文档移动导致链接失效，先回滚到根目录，确认无遗漏后再移动。
- 如果包管理器无法识别工作区，检查配置文件语法，不要开始安装依赖。

---

### 步骤 P1-03：统一代码风格与工具配置

**目标**：在写第一行业务代码前，先确定并落地理型、格式化、忽略规则。

**动作**：

- 在根目录创建以下配置文件（只写规则，不写代码）：
  - `.editorconfig`
  - `.gitignore`（覆盖 Node、Next.js、小程序、macOS、IDE、环境变量文件）
  - `.prettierrc`（统一格式化规则）
  - `eslint` 配置（根配置 + 各子应用扩展配置）
  - `tsconfig` 根配置 + 各子应用继承配置
- 如果使用 pnpm，配置 `.npmrc` 指定 registry、strict-peer-dependencies 等。
- 不要写任何业务代码或测试。

**验证**：

- 所有配置文件能被对应工具读取（例如 Prettier 能格式化一个空 TS 文件不报错）。
- TypeScript 根配置能被 `tsc --noEmit` 在空项目下通过（无类型错误）。
- ESLint 在空项目下能运行且不崩溃。

**止血**：

- 如果某工具配置冲突无法解决，先移除该工具配置，记录到 `decisions.md` 的"已知妥协"章节，再继续。
- 不要在配置未就绪时开始写业务代码。

---

## Phase 2 · 共享层（必须先做）

### 步骤 P2-01：定义共享 Design Token

**目标**：把 `memory-bank/design-document.md` 中的色彩、字体、字号、间距、圆角、阴影、动效 token 提取为唯一真源。

**动作**：

- 在 `packages/shared` 下创建 token 源文件（TS 对象形式），包含以下命名空间：
  - `colors`：完全对照 `memory-bank/design-document.md` 2.1 节的 Token 与 Hex。
  - `typography`：fontFamily、fontSize、lineHeight、fontWeight。
  - `space`：4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64。
  - `radius`：card、button、chip、fab、agent、modal。
  - `shadows`：card、elevated、fab、modal、focusRing。
  - `durations`：fast / base / slow 及对应缓动曲线。
- 创建同步脚本说明（不实现脚本），未来用于生成 `tokens.wxss` 和 Web CSS 变量。

**验证**：

- 逐条核对 `memory-bank/design-document.md` 2.1–2.5 节，确认没有遗漏 Token。
- 任选一个 Token 值，能说出它对应的设计文档出处。
- 小程序和 Web 的负责人（或你自己）都确认可以从该源文件消费。

**止血**：

- 若设计文档中某处 Token 冲突（例如同一用途给出不同 hex），以 `memory-bank/design-document.md` 最新版本正文表格为准，并在 `decisions.md` 记录冲突与裁决。
- 不要为了让两边消费方便而在 token 层妥协命名。

---

### 步骤 P2-02：定义共享类型与常量

**目标**：把跨端共用的领域概念类型化，避免各端各自命名。

**动作**：

- 在 `packages/shared` 下创建类型定义文件，包含以下领域类型（仅接口名与字段，不写实现）：
  - User、Profile、SocialLink
  - Objective（枚举或联合类型）
  - Match、MatchStatus
  - A2ASession、A2AMessage、A2ARole
  - A2ASummary、AlignmentScore
  - Invitation、Meeting、FeedbackCard
  - PublicPage
- 创建常量文件，包含 supertag 库（`memory-bank/design-document.md` 5.8 节）与 A2A 轮次上限。

**验证**：

- 类型文件能被 `tsc --noEmit` 正确编译。
- 每个类型字段都能对应到 `Pair-PRD-前三期.md` 或 `memory-bank/design-document.md` 的某一段描述。
- 没有字段使用 `any` 或 `unknown` 逃避类型。

**止血**：

- 如果某领域概念在文档中描述不一致，先用最严格的定义，并在 `decisions.md` 标注待人工确认。
- 不要等所有细节确认完毕才创建类型；类型可以后续迭代，但不能没有。

---

## Phase 3 · 后端基础

### 步骤 P3-01：初始化 NestJS 项目

**目标**：在 `apps/api` 下创建可运行的 NestJS 最小工程。

**动作**：

- 使用 NestJS CLI 在 `apps/api` 目录初始化项目，选择 pnpm/npm、TypeScript、严格模式。
- 删除初始化生成的示例模块、示例控制器、示例服务、示例测试文件。
- 安装 `memory-bank/design-document.md` / `memory-bank/tech-stack.md` 要求的核心依赖：Prisma、@nestjs/config、class-validator、class-transformer、Pino、BullMQ、ioredis、@nestjs/jwt、@nestjs/passport（如需要）、@nestjs/throttler。
- 配置 `.env.example`，列出所有必需环境变量（数据库 URL、Redis URL、JWT Secret、OpenAI Key、微信 AppID/Secret 等），但不写真实值。
- 将 `apps/api` 的 `tsconfig.json` 继承根配置。

**验证**：

- 运行 `npm run start:dev`（或对应命令）能启动且端口监听成功。
- 访问根路径返回 404 或健康检查响应，而不是启动崩溃。
- `.env.example` 包含所有后续步骤会用到的环境变量名。

**止血**：

- 如果 NestJS CLI 初始化失败，检查 Node 版本是否满足 NestJS 要求，不要手动复制模板项目。
- 如果启动崩溃，先停止，检查依赖安装日志，修复后再推进。

---

### 步骤 P3-02：配置 Prisma 与数据库连接

**目标**：建立 Prisma schema 与数据库的连接能力。

**动作**：

- 在 `apps/api` 下初始化 Prisma（生成 `prisma/schema.prisma` 与 `.env` 引用）。
- 配置 datasource db 指向 PostgreSQL。
- 创建第一个 migration：仅包含 `User` 与 `Profile` 两张表的最小 schema，字段对照 `Pair-PRD-前三期.md` 数据模型。
- 配置 `prisma/seed.ts` 占位（空文件），后续填充。
- 将 Prisma Client 生成目录加入 `.gitignore`。

**验证**：

- 本地或远程 PostgreSQL 可连接，运行 `prisma migrate dev` 成功。
- `prisma generate` 成功生成 Client。
- 使用 Prisma Studio 能看到 `User` 与 `Profile` 表结构正确。

**止血**：

- 如果数据库连接失败，确认 `.env` 中的 `DATABASE_URL` 格式正确、网络可达、用户权限足够。
- 不要在没有可连接数据库的情况下继续下一步。

---

### 步骤 P3-03：落地完整 Prisma Schema

**目标**：把 Phase 1 需要的所有表结构写入 Prisma schema。

**动作**：

- 按 `Pair-PRD-前三期.md` 数据模型与 `memory-bank/tech-stack.md` 关键表列表，在 `schema.prisma` 中新增：
  - `Objective`
  - `Match`
  - `A2ASession`、`A2AMessage`
  - `A2ASummary`
  - `Invitation`、`Meeting`
  - `FeedbackCard`
  - `PublicPage`
  - `SocialLink`
- 为每张表设置主键、外键、索引、枚举状态字段、JSONB 字段（用于动态标签与 A2A 消息元数据）。
- 生成 migration 并应用。

**验证**：

- `prisma migrate dev` 成功且无警告。
- Prisma Studio 能查看所有表及其关系。
- 手动检查：每一张表都能对应到 `Pair-PRD-前三期.md` 的实体说明。

**止血**：

- 如果 migration 失败，先 `migrate reset`（仅本地开发库），修正 schema 后再试。
- 若关系设计不确定，先用最保守的一对多关系，不要过早使用多对多隐式表。

---

### 步骤 P3-04：配置日志、健康检查、全局异常与限流

**目标**：让 API 具备可观测基础与基本防护。

**动作**：

- 配置 Pino 日志：请求日志、错误日志、环境变量控制级别。
- 配置 `@nestjs/terminus` 健康检查端点，检查数据库与 Redis 连通性。
- 配置全局异常过滤器，统一返回 `{ code, message, details }` 结构，不暴露堆栈。
- 配置 `@nestjs/throttler`，对登录、注册、A2A 创建等敏感接口做限流。
- 配置 CORS，只允许小程序和 Web 公开页的域名。

**验证**：

- 访问健康检查端点，返回 `status: ok` 且包含 db、redis 状态。
- 手动触发一个不存在路由的 404，响应体符合统一结构。
- 快速连续请求同一接口，触发限流时返回 429。

**止血**：

- 如果限流影响本地开发，先放宽限流阈值，但必须在提交前恢复合理值。
- 如果健康检查误报，检查 Redis 连接配置是否为短连接或集群模式。

---

### 步骤 P3-05：实现微信登录与 JWT 鉴权

**目标**：完成小程序用户登录链路。

**动作**：

- 创建 `AuthModule`，包含：
  - `POST /auth/wechat-login`：接收 `code`，调用微信 `jscode2session` 换 `openid`/`unionid`， upsert User，签发 JWT。
  - `JwtStrategy` / `JwtAuthGuard`：保护后续业务接口。
  - `RefreshToken` 机制（access token 短效 + refresh token 长效，Redis 存 refresh token 黑名单）。
- 创建 `UsersModule` 最小 CRUD（读当前用户、更新昵称/头像）。
- 创建 `CurrentUser` 装饰器，从 JWT 解析用户 ID。

**验证**：

- 使用一个有效微信 `code`（真机或测试号）调用登录接口，返回包含 accessToken 与 refreshToken。
- 使用错误 `code` 调用，返回明确错误码，不泄漏微信原始错误细节。
- 访问受保护接口：
  - 无 Token 返回 401。
  - 错误 Token 返回 401。
  - 正确 Token 能拿到当前用户数据。
- refresh token 轮换一次后，旧 refresh token 失效。

**止血**：

- 如果微信 `jscode2session` 调试困难，先用 mock 接口返回固定 openid 走通 JWT 链路，但必须用 feature flag 控制，不能进生产。
- 不要把微信 Secret 硬编码，必须用环境变量。

---

### 步骤 P3-06：实现 Profile 与 Objective 模块

**目标**：用户可以创建、查看、编辑自己的职场档案与目标。

**动作**：

- 创建 `ProfilesModule`：
  - `GET /profiles/me`：读取当前用户档案。
  - `POST /profiles/me`：创建或更新档案（姓名、头衔、简介、社交链接、supertags）。
  - 档案字段必须覆盖 `memory-bank/design-document.md` 屏 4 的示例。
- 创建 `ObjectivesModule`：
  - `GET /objectives`：返回可选 objectives 列表。
  - `POST /users/me/objectives`：保存用户选中的 1–3 个 objectives。
- 所有写入操作校验输入并返回统一错误结构。

**验证**：

- 登录用户能完整创建自己的档案，再用 `GET /profiles/me` 读回，数据一致。
- `POST /users/me/objectives` 选择超过 3 个时返回 400。
- 未登录用户访问返回 401。

**止血**：

- 如果 supertag 校验复杂，先只做字符串数组，后续再加 supertag 库枚举校验。
- 若 objective 列表与设计文档不一致，以 `memory-bank/design-document.md` 5.8 节与屏 5 为准。

---

## Phase 4 · AI 与 A2A 引擎

### 步骤 P4-01：集成 OpenAI 与 Prompt 管理基础设施

**目标**：让后端能调用 LLM，并把 Prompt 从业务代码中分离。

**动作**：

- 创建 `AiModule`，封装 OpenAI Client，支持环境变量配置 API Key、Base URL、模型名。
- 创建 `prompts/` 目录，按功能分类存放 Prompt 模板文件（档案解析、标签抽取、A2A 对话、开场白、Summary、对齐度打分）。
- 每个 Prompt 模板文件顶部用注释写明版本、输入变量、输出 schema、适用模型。
- 创建 `AiService`，提供统一调用方法：输入 prompt + schema，返回结构化 JSON。

**验证**：

- 用一个简单 Prompt（例如"把输入字符串转成大写 JSON"）调用 `AiService`，能返回合法 JSON。
- 故意给非法输出，调用方能抛出可识别的解析错误。
- 所有 Prompt 文件都能在仓库中被 grep 到，而不是散落在 controller/service 中。

**止血**：

- 如果 OpenAI API 无法访问，先用本地 mock 服务或固定 JSON 返回走通接口，但记录为"必须替换为真实 LLM"。
- 不要把 API Key 写入 Prompt 文件或日志。

---

### 步骤 P4-02：实现公开资料抓取服务

**目标**：把用户提供的 LinkedIn / 小红书 / 个人站 URL 转成可用文本。

**动作**：

- 创建 `ScraperModule` 与 `ScraperService`。
- 集成 `memory-bank/tech-stack.md` 选定的抓取服务（Jina AI Reader 或 Firecrawl）。
- 实现 `scrape(url: string)` 方法，返回 `{ title, content, url }`。
- 对失败 URL 返回明确错误（不可访问、反爬、内容过短）。
- 在 `decisions.md` 记录抓取服务的 quota 与备用方案。

**验证**：

- 输入一个公开博客或个人站 URL，能返回非空 Markdown 内容。
- 输入一个明显不存在 URL，返回 400 级别错误。
- 抓取结果长度小于 100 字符时标记为"内容不足"。

**止血**：

- 如果第三方抓取服务不稳定，立即实现一个"用户粘贴文本"的 fallback 接口，让注册流程不阻塞。
- 不要对小书/LinkedIn 做高强度绕过，合规优先。

---

### 步骤 P4-03：实现档案 v0 自动生成

**目标**：Agent 读完公开资料后，自动提炼出档案草稿。

**动作**：

- 在 `ProfilesModule` 中新增 `POST /profiles/me/generate`：接收可选 URL 或粘贴文本，调用 Scraper + LLM。
- LLM 输出结构包含：displayName、title、bio、supertags、socialLinks、summary。
- 生成结果不直接覆盖原档案，而是作为 `draft` 返回给前端预览。
- 用户确认后，再调用更新接口保存为正式档案。
- 将生成任务异步化：先走 BullMQ，接口返回 jobId，前端轮询进度。

**验证**：

- 输入一段公开资料文本，能在 10 秒内返回 draft JSON，且字段完整。
- 输入空文本返回 400。
- 生成任务进入 BullMQ 且能消费完成。
- 生成的 supertags 必须在 `memory-bank/design-document.md` 5.8 节的 supertag 库中，或标记为"未识别"。

**止血**：

- 如果 LLM 输出不稳定，增加 retry 与 schema 校验失败时的 fallback 默认值。
- 若异步队列跑不通，先用同步调用走 Demo，但代码结构要保留 BullMQ 接入点。

---

### 步骤 P4-04：实现 Match 引擎（最小版）

**目标**：根据用户档案与 objectives，生成候选匹配。

**动作**：

- 创建 `MatchesModule`：
  - `GET /matches`：返回当前用户的待审匹配列表。
  - `POST /matches/:id/pass`：用户 Pass 某个匹配。
  - `POST /matches/:id/accept`：用户接受，进入 A2A 流程。
- 最小版 Match 算法：基于 supertag 重叠度和 objectives 匹配，硬编码权重，不调用 LLM。
- 创建 seed 脚本生成 5–10 个测试用户与档案，用于本地演示。

**验证**：

- 登录测试用户 A，能看到至少 1 个候选匹配（来自 seed 用户 B）。
- Pass 后该匹配从列表消失或状态变更。
- Accept 后创建 A2A Session 并返回 sessionId。

**止血**：

- 如果匹配算法效果差，先接受" Demo 阶段手动造数据"，不要急于上向量检索。
- 如果 seed 脚本写入真实数据库，确保只在开发环境运行。

---

### 步骤 P4-05：实现 A2A 引擎

**目标**：双方 Agent 进行 5 轮对话，产出 Summary 与对齐度。

**动作**：

- 创建 `A2aModule`，包含：
  - `POST /a2a`：接受 matchId，创建 A2A Session，启动 BullMQ job。
  - `GET /a2a/:id`：返回 Session 状态与当前 messages。
  - `POST /a2a/:id/abort`：用户截停对话。
- A2A job 逻辑：
  - 读取双方 Profile、Objective。
  - 循环 5 轮，每轮调用 LLM 生成一条 Agent 发言。
  - 每生成一条，写入 `A2AMessage` 表。
  - 最后调用 LLM 生成 Summary（对齐度 1–10、双方视角、话题列表、风险提示）。
- 所有 LLM 调用必须记录 token 消耗与耗时。

**验证**：

- 调用 `POST /a2a` 后，BullMQ job 启动，数据库出现 5 条 message 与 1 条 summary。
- `GET /a2a/:id` 能实时返回当前进度，包括 currentRound、estimatedSeconds、messages。
- 调用 abort 后，状态变为 aborted，不再继续生成。
- Summary 包含对齐度数字、双方视角、至少 3 个可聊话题。

**止血**：

- 如果 LLM 成本过高，先减少轮次到 3 轮，或降低生成频率，记录到 `decisions.md`。
- 如果 A2A job 失败，必须记录失败原因并更新 session 状态为 failed，不能无限重试。

---

## Phase 5 · 微信小程序

### 步骤 P5-01：初始化微信小程序项目

**目标**：在 `apps/miniprogram` 下创建可运行的微信原生 + TypeScript 小程序。

**动作**：

- 使用微信官方模板或手动创建小程序基础文件：`app.json`、`app.ts`、`app.wxss`、`sitemap.json`。
- 配置 TypeScript：`tsconfig.json` 继承根配置，启用严格模式。
- 配置 `project.config.json`，指定 appid 为测试号或真实小程序 ID。
- 删除所有示例页面与示例资源。
- 在 `app.json` 中配置分包：
  - 主包：`pages/app/*`
  - 分包：`pages/a2a/*`、`pages/public/*`、`pages/people/*`

**验证**：

- 用微信开发者工具打开 `apps/miniprogram`，能编译通过，模拟器显示首页（可暂时空白）。
- 主包体积在开发者工具详情中显示小于 1 MB。
- 分包配置无报错，能正确生成分包。

**止血**：

- 如果微信开发者工具无法打开，检查 `project.config.json` 的 `miniprogramRoot` 是否指向正确。
- 如果 TypeScript 编译报错，先修复 tsconfig，不要绕过 strict 模式。

---

### 步骤 P5-02：同步 Token 与字体到小程序

**目标**：把 `packages/shared` 的 token 转化为小程序可用的样式变量。

**动作**：

- 在 `apps/miniprogram` 下创建 `tokens.wxss`，把 `packages/shared` 的 token 转换为 CSS 变量。
- 在 `app.wxss` 中导入 `tokens.wxss`。
- 配置字体加载：
  - Fraunces 子集化字体通过 `wx.loadFontFace` 或 CDN 引入。
  - 中文衬线使用系统字体 fallback 栈。
  - Inter/PingFang 使用系统默认。
- 创建字体使用类名工具（例如 `.font-serif-cn`、`.font-sans`、`.font-mono`）。

**验证**：

- 在首页写一个测试文本，分别应用 serif、sans、mono 类名， visually 正确（serif 有衬线，mono 等宽）。
- 检查网络面板，Fraunces 字体文件大小小于 100 KB。
- `tokens.wxss` 中所有 hex 与 `packages/shared` 一致。

**止血**：

- 如果 Fraunces 加载失败，先降级为系统 Georgia，确保不影响其他开发。
- 如果中文衬线显示不理想，确认 fallback 链包含 `STSongti-SC` 与 `Source Han Serif SC`。

---

### 步骤 P5-03：实现 4 个基础组件

**目标**：落地 Card / Button / Chip / FAB，作为所有 UI 的基石。

**动作**：

- 在 `apps/miniprogram/components` 下创建：
  - `pair-card`：bg、border、radius 18、padding 20、shadow-card。
  - `pair-button`：支持 primary / secondary / ghost 三态，height 44、radius 12。
  - `pair-chip`：支持 outline / filled / selected 三态，pill 形，14px radius。
  - `pair-fab`：56x56 圆形、右下角、shadow-fab、点击 scale 0.96。
- 每个组件只接收属性、渲染样式、触发事件，不写业务逻辑。
- 组件样式全部使用 `tokens.wxss` 变量。

**验证**：

- 在一个测试页面同时展示 4 个组件，视觉与 `memory-bank/design-document.md` 5.2–5.5 节一致。
- 检查真机（或模拟器）上没有硬编码 hex；所有颜色来自 CSS 变量。
- Button 三种状态、Chip 三种状态点击后切换正常。
- FAB 点击有 120ms scale 反馈。

**止血**：

- 如果某个组件视觉对不上设计文档，先回到 token 文件核对，不要硬改组件内的值。
- 如果组件事件无法触发，检查小程序事件绑定写法，不要改组件属性命名去将就事件。

---

### 步骤 P5-04：实现 Agent 视觉组件

**目标**：把 Agent 的 14px 渐变圆点 + thinking 呼吸动画做成独立组件。

**动作**：

- 创建 `pair-agent-dot` 组件：
  - 默认状态：14px 圆，linear-gradient 135deg accent → accent-dark。
  - thinking 状态：外发光 4px accent-glow，1.4s 呼吸动画。
  - 支持 size 属性（默认 14，可放大用于插画场景）。
- 创建 `pair-agent-status` 组件：组合 dot + 一行状态文案（衬线字体）。
- 确保不使用任何拟人头像、emoji、机器人图标。

**验证**：

- 展示默认 dot 与 thinking dot，确认 thinking 有持续呼吸光晕。
- 用微信开发者工具真机预览，确认 1.4s 动画流畅，不掉帧。
- 检查组件目录，确认没有任何 PNG/JPG 头像资源。

**止血**：

- 如果 CSS 动画在真机上卡顿，改用 `wx.createAnimation` 或降低光晕模糊半径。
- 绝不允许用 GIF 或图片替代 CSS 动画。

---

### 步骤 P5-05：实现 Onboarding 5 屏

**目标**：完成注册流程的全部 5 个页面。

**动作**：

- 按 `memory-bank/design-document.md` 4.1 节，创建以下页面：
  - 屏 1 · 登录：微信一键登录 + Google 登录占位。
  - 屏 2 · 添加身份：URL 输入框 + "让 Agent 读"按钮。
  - 屏 3 · Agent 抓取中：插画 + 进度条 + 状态文案轮播。
  - 屏 4 · 档案预览：卡片展示 draft + "看起来对" + "让 Agent 重新读"。
  - 屏 5 · objectives 选择：1–3 项可多选卡片。
- 插画先用占位 SVG（单色 1.5px 描边），后续再替换为精稿。
- 页面间导航使用 `wx.navigateTo` / `wx.redirectTo`。

**验证**：

- 完整走一遍登录 → 输入 URL → 生成中 → 预览档案 → 选择 objectives → 完成注册，无报错。
- 屏 3 的进度条与状态文案随后端 job 进度更新。
- 屏 4 的 draft 数据来自后端 `POST /profiles/me/generate`。
- 屏 5 选择超过 3 项时给出提示，且"完成注册"按钮未激活。

**止血**：

- 如果后端生成接口未就绪，先用 mock 数据走通 UI，但所有接口调用点必须保留。
- 如果登录流程在微信开发者工具无法测试，申请测试号或先用 mock openid。

---

### 步骤 P5-06：实现 Today 主屏与 Match Card

**目标**：完成产品最核心的首页。

**动作**：

- 创建 `pages/app/today` 页面：
  - Hero 区："下午好，{name}" + Agent status 行。
  - 今日匹配列表：使用 `pair-card` 展示 Match Card。
  - 每个 Match Card 包含：姓名、职位、supertag chips、Why ta、Agent drafted 开场白、三个操作按钮。
  - 底部："想找特定的人？ ⌘K"文字链 + FAB。
- 实现操作：
  - "发出"：调用后端 accept/invite 接口，进入 A2A 或等对方接受。
  - "改写"：打开抽屉输入新开场白。
  - "Pass"：调用 pass 接口，卡片移除。
- 空状态：手绘插画 + Agent 一段话 + "主动找"CTA。

**验证**：

- 有匹配时显示 Match Card 列表；无匹配时显示空状态。
- 点击"Pass"后卡片以 240ms 动画滑出（或淡出）。
- "发出"后跳转 A2A Dialogue 页或显示"等对方接受"状态。
- Agent status 文案使用衬线字体，与 `memory-bank/design-document.md` 一致。

**止血**：

- 如果列表为空导致页面太空，用 seed 数据或 mock 数据填充，不要隐藏空状态逻辑。
- 如果"发出"后端未就绪，先前端状态切换，记录为"待后端对接"。

---

### 步骤 P5-07：实现 A2A Dialogue 实时预览页

**目标**：完成 Pair 的"灵魂屏"。

**动作**：

- 创建 `pages/a2a/dialogue` 页面：
  - 顶部标题"双方 Agent 正在对齐" + 预计时间 + 截停按钮。
  - 中间消息区：双方 Agent 发言左右对齐，每条消息入场动画 fade + translateY(8px)，240ms。
  - 底部：进度条 + 预计剩余时间 + 截停按钮。
- 使用 1.5s 轮询调用 `GET /a2a/:id` 刷新消息与状态。
- 实现"截停"：调用 `POST /a2a/:id/abort`，状态变 aborted 后停止轮询。
- A2A 完成后自动跳转到 A2A Summary 页。

**验证**：

- 进入页面后，每 1.5s 发起一次请求，网络面板可见。
- 新消息出现时有过渡动画，不是直接闪现。
- 截停后不再发起轮询，页面显示"已截停"状态。
- 完成后自动跳转 Summary 页，并携带 sessionId。

**止血**：

- 如果轮询频率导致后端压力过大，先提升到 2s，并记录到 `decisions.md`。
- 如果动画在低端机上卡顿，关闭 translateY，只保留 opacity 过渡。

---

### 步骤 P5-08：实现 A2A Summary Card 页

**目标**：完成 A2A 结果展示页。

**动作**：

- 创建 `pages/a2a/summary` 页面：
  - 顶部手绘插画（占位 SVG）。
  - Hero"对齐完成"+ 对齐度大数字（36px Fraunces）。
  - "你眼中的 Sarah" 与 "Sarah 眼中的你"两段摘要，使用 bg-sunken 微底。
  - "可以聊的话题" bullet 列表。
  - 风险提示（仅有时显示）。
  - 主 CTA"安排见面"与次 CTA"我先看看" + 文字链。
- 数据来自 `GET /a2a/:id` 返回的 summary 字段。

**验证**：

- 对齐度数字使用 Fraunces 字体，颜色为 accent-dark。
- 摘要区域使用衬线字体，正文使用无衬线字体。
- 无风险提示时，不显示风险提示区块。
- "安排见面"点击进入邀约流程（可先 Toast"功能开发中"）。

**止血**：

- 如果 summary 数据字段缺失，页面不崩溃，缺失字段显示占位符"—"。
- 如果 Fraunces 字体未加载，数字先使用 Georgia，不能出现系统默认无衬线。

---

### 步骤 P5-09：实现 Drawer 人详情与 Settings

**目标**：完成辅助页面，不阻塞主流程但提升完整度。

**动作**：

- 创建 `pages/people/detail` 或 Drawer 组件：
  - 从底部滑入的半屏抽屉。
  - 内容：头像、名字、supertag、Why now、建议话题、历史互动、CTA。
- 创建 `pages/app/settings` 页面：
  - 头像、objectives 卡片、偏好、屏蔽、账号。
  - 极简列表，每项一行。

**验证**：

- 在 Today 页点击 Match Card 除按钮外区域，能弹出 Drawer。
- Drawer 滑入动画 360ms，符合 `memory-bank/design-document.md` 动效规格。
- Settings 页能读取并展示当前用户 Objectives。

**止血**：

- 如果 Drawer 与页面路由冲突，先用独立页面实现，不阻塞 Today 主流程。
- Settings 保存失败时，保留用户输入，显示 Toast 错误。

---

## Phase 6 · Web 公开档案页

### 步骤 P6-01：初始化 Next.js 14 项目

**目标**：在 `apps/web` 下创建可运行的 Next.js 14 App Router 项目。

**动作**：

- 使用官方 create-next-app 在 `apps/web` 初始化，选择 TypeScript、App Router、no src directory、ESLint、no Tailwind（后续手动配置 token）。
- 删除默认首页、默认样式、默认字体。
- 将 `apps/web` 的 `tsconfig.json` 继承根配置。
- 安装 `memory-bank/tech-stack.md` 指定的依赖：framer-motion、@vercel/og、satori（或确认 @vercel/og 已内置）。

**验证**：

- 运行 `npm run dev`，访问 `http://localhost:3000` 能显示自定义占位首页。
- `npm run build` 能成功构建（无业务逻辑也应通过）。
- TypeScript 严格模式开启，无类型错误。

**止血**：

- 如果初始化工具要求不同目录结构，先接受默认，后续再迁移到 `apps/web`。
- 如果 build 失败，先修复配置，不要关闭 strict 模式。

---

### 步骤 P6-02：同步 Token 与字体到 Web

**目标**：让 Web 端使用与小程序一致的 design token。

**动作**：

- 在 `apps/web` 下创建全局 CSS 变量文件，把 `packages/shared` 的 token 转换为 `:root` CSS 变量。
- 配置 Fraunces 字体：子集化 WOFF2 自托管或 Google Fonts 按需加载。
- 配置中文衬线 fallback、无衬线 fallback、mono fallback。
- 创建工具类名（例如 `.font-serif-cn`、`.text-hero-cn`、`.card`）。

**验证**：

- 在首页展示 Hero 中文、英文数字、正文、mono 文本， visually 正确。
- 检查 Fraunces 字体请求大小小于 100 KB。
- CSS 变量值与 `packages/shared` 完全一致。

**止血**：

- 如果 Google Fonts 在国内加载慢，改为自托管子集字体。
- 如果 Tailwind 默认色板被误引入，移除 Tailwind 或完全覆盖 theme。

---

### 步骤 P6-03：实现公开档案页路由与布局

**目标**：完成 `pair.app/u/{slug}` 页面骨架。

**动作**：

- 创建 `app/u/[slug]/page.tsx` 路由。
- 实现 `generateMetadata`：根据 slug 读取公开档案，生成 title、description、OG image URL。
- 创建基础布局：顶部极简 nav、主内容区、最大宽度约束、米白背景。
- 创建错误页与 not-found 页。

**验证**：

- 访问 `/u/test-user` 能渲染页面（可暂时只显示 slug）。
- 查看页面源码，`<head>` 中包含正确的 title 与 og:image meta。
- 访问不存在的 slug 返回 404 页面。

**止血**：

- 如果后端公开档案 API 未就绪，先用静态 mock 数据渲染，但路由与 metadata 结构保留。
- 如果 OG image 生成失败，fallback 到默认 Pair logo 图。

---

### 步骤 P6-04：实现公开档案页 UI

**目标**：按 `memory-bank/design-document.md` 4.5 节完整实现公开档案页。

**动作**：

- 调用后端 `GET /public/:slug` 获取公开档案数据。
- 实现手绘名片边框包裹的 hero 区。
- 实现巨型中文 Hero 姓名、职位、supertag 横排、简介、objectives 列表。
- 实现主 CTA"让 Agent 帮我们破冰" + 提示"需要先安装 Pair 小程序"。
- 实现二维码占位（引导扫码）。
- 确保不暴露邮箱、电话、实时位置。

**验证**：

- 页面视觉与 `memory-bank/design-document.md` 4.5 节线框图一致。
- 响应式：在 375px 与 768px 宽度下都能正常显示。
- 检查页面源码，没有邮箱、电话等敏感信息。
- CTA 点击打开微信小程序码或跳转小程序。

**止血**：

- 如果后端接口字段缺失，缺失字段显示占位符，页面不崩溃。
- 如果二维码生成复杂，先用静态小程序码图片，后续替换为动态生成。

---

### 步骤 P6-05：实现动态 OG Image

**目标**：分享公开档案时生成精美卡片图。

**动作**：

- 创建 `app/u/[slug]/opengraph-image.tsx`（或 `route.tsx`）。
- 使用 `@vercel/og` 把公开档案渲染为 1200×630 PNG。
- 样式复用 Pair 设计 token：米白背景、中文衬线 Hero、supertag、名片边框。
- 图片中不暴露敏感信息。

**验证**：

- 访问 `/u/test-user/opengraph-image`，返回 PNG 图片且内容正确。
- 用本地工具检查图片尺寸为 1200×630。
- 分享 URL 时，微信 / Twitter / Facebook 调试工具能抓取到该图片。

**止血**：

- 如果 @vercel/og 渲染中文衬线失败，fallback 到系统衬线或英文档案页暂只显示英文。
- 如果 OG image 构建耗时过长，改为 build 时静态生成前 N 个用户，其他走运行时。

---

## Phase 7 · 集成与端到端

### 步骤 P7-01：定义并文档化 API 契约

**目标**：让小程序、Web、后端三端对接有明确依据。

**动作**：

- 在 `docs/api-contract.md` 中列出所有接口：
  - 路径、方法、鉴权方式、请求字段、响应字段、错误码。
  - 重点写明 A2A 轮询接口的响应结构与状态机。
- 所有字段类型引用 `packages/shared` 中的类型名。
- 不包含实现代码，只写契约。

**验证**：

- 后端每个 controller 的路由都能在契约中找到。
- 小程序每个 API 调用都能在契约中找到对应接口。
- Web 公开页每个数据获取都能在契约中找到对应接口。

**止血**：

- 如果三端对某个字段命名不一致，统一改名为契约中的命名，不要各自为政。
- 如果契约遗漏接口，先补充契约再改代码。

---

### 步骤 P7-02：对接登录与档案流程

**目标**：小程序端到后端，登录 → 生成档案 → 保存档案 → 选择 objectives 能跑通。

**动作**：

- 在小程序端封装请求客户端：自动注入 JWT、处理 401 刷新、统一错误提示。
- 对接 `POST /auth/wechat-login`。
- 对接 `POST /profiles/me/generate` 与 `GET /profiles/me`。
- 对接 `POST /users/me/objectives`。
- 在 Onboarding 5 屏中移除 mock，全部走真实接口。

**验证**：

- 用真机或开发者工具完成一次完整注册流程，数据库出现对应 User、Profile、Objective 记录。
- Token 过期后，客户端自动用 refresh token 换取新 token，用户无感知。
- 接口报错时，前端显示符合 `memory-bank/design-document.md` 文案风格的错误提示（不卖萌、无 emoji）。

**止血**：

- 如果微信登录在开发者工具无法测试，先用测试号或 mock 登录走通后端对接。
- 如果档案生成超时，前端显示"Agent 还在读，请稍等"并允许重试。

---

### 步骤 P7-03：对接 Match 与 A2A 流程

**目标**：Today 主屏 → A2A Dialogue → A2A Summary 完整闭环。

**动作**：

- 小程序对接 `GET /matches`、 `POST /matches/:id/pass`、 `POST /matches/:id/accept`。
- 对接 `POST /a2a`、 `GET /a2a/:id`、 `POST /a2a/:id/abort`。
- 对接 `GET /a2a/:id` 的 summary 字段用于 Summary 页。
- Web 公开页对接 `GET /public/:slug`。

**验证**：

- 完成一次：登录 → 看到 Match → Accept → A2A 5 轮 → Summary → 点击"安排见面"。
- 整个过程中网络请求无 500，数据库状态正确流转。
- 截停后能正确停止并显示 aborted 状态。

**止血**：

- 如果 A2A LLM 调用失败，session 状态应为 failed，前端显示"Agent 谈不拢，稍后再试"。
- 如果轮询返回 404，停止轮询并提示用户返回首页。

---

### 步骤 P7-04：实现反馈卡与会后流程（可选，Demo 前完成）

**目标**：完成见面后的最小反馈闭环。

**动作**：

- 后端新增 `FeedbackCard` 相关接口：创建、提交（见到了吗、打分 1–5、一句话标签）。
- 小程序新增反馈卡页面。
- 在"安排见面"后，预约时间到达后触发反馈卡推送（小程序订阅消息）。

**验证**：

- 能创建反馈卡并提交，数据库记录完整。
- 提交后显示感谢状态与手绘插画。

**止血**：

- 如果订阅消息权限未申请，先用前端主动入口，不阻塞 Demo。
- 如果推送复杂，Demo 阶段改为手动点击"记录反馈"。

---

## Phase 8 · 部署与 CI/CD

### 步骤 P8-01：配置后端部署

**目标**：让 API 能在云端运行。

**动作**：

- 选择 `decisions.md` 确定的托管商（Railway / Render / 阿里云 ECS）。
- 创建 Dockerfile（如需要）或遵循托管商 Node 部署规范。
- 配置环境变量：数据库 URL、Redis URL、JWT Secret、OpenAI Key、微信 AppID/Secret。
- 配置健康检查端点作为启动探针。
- 部署并绑定自定义域名 `api.pair.app`（如可用）。

**验证**：

- 访问 `https://api.pair.app/health` 返回 `status: ok`。
- 数据库与 Redis 连通性检查通过。
- SSL 证书有效，HTTPS 强制开启。

**止血**：

- 如果部署失败，先在本地用生产环境变量 `npm run start:prod` 验证，再上传。
- 如果域名未备案，先用托管商默认域名。

---

### 步骤 P8-02：配置 Web 部署

**目标**：让公开档案页能在 Vercel 运行。

**动作**：

- 将 `apps/web` 推送到 Vercel 项目，绑定域名 `pair.app`。
- 配置环境变量：API_BASE_URL 指向已部署后端。
- 配置 ISR 或 SSR 策略（公开档案页建议 SSR，OG image 运行时生成）。
- 配置自动分支预览。

**验证**：

- 访问 `https://pair.app/u/test-user` 能正确渲染。
- `/u/test-user/opengraph-image` 能返回 PNG。
- 非主分支提交能生成预览链接。

**止血**：

- 如果国内访问 Vercel 慢，评估是否需要 CDN 回源或迁移到国内云服务。
- 如果 build 因后端未部署失败，先用 mock 数据让 build 通过。

---

### 步骤 P8-03：配置小程序 CI 上传

**目标**：每次合并到主分支自动上传小程序体验版。

**动作**：

- 在 `.github/workflows` 下创建小程序 CI 工作流：
  - 安装依赖。
  - 类型检查。
  - 使用 `miniprogram-ci` 上传体验版。
- 配置 GitHub Secrets：`WECHAT_APPID`、`WECHAT_PRIVATE_KEY`。
- 配置预览版上传（PR 阶段）。

**验证**：

- 手动触发一次工作流，能在微信小程序后台看到新的体验版。
- PR 能生成预览二维码。
- 工作流失败时阻止合并。

**止血**：

- 如果 `miniprogram-ci` 证书配置复杂，先保留手动上传，CI 仅做类型检查。
- 不要把私钥提交到仓库。

---

### 步骤 P8-04：配置后端与 Web 的 CI

**目标**：保证代码质量与部署自动化。

**动作**：

- 创建后端 CI：lint、type-check、test（占位）、build、部署到托管商。
- 创建 Web CI：lint、type-check、build、部署到 Vercel。
- 配置分支保护：PR 必须通过 CI 才能合并。

**验证**：

- 提交一个 PR，所有 CI 检查通过。
- 合并到主分支后，后端与 Web 自动部署。
- 故意引入一个类型错误，CI 失败并阻止合并。

**止血**：

- 如果测试未写，CI 中先跳过 test 步骤，但 lint 与 type-check 不能跳过。
- 如果部署步骤频繁失败，先只做 build 与上传产物，手动触发部署。

---

## Phase 9 · 收尾与质量

### 步骤 P9-01：视觉一致性 Audit

**目标**：确保所有页面符合 `memory-bank/design-document.md` 视觉系统。

**动作**：

- 逐页检查：
  - 无硬编码 hex，全部来自 token。
  - 中文 Hero 使用衬线粗体。
  - Agent 仅使用 14px 渐变圆点，无拟人头像。
  - 主按钮为近黑底白字，非 accent。
  - 无 9–10px 字体。
  - 无 spinner，加载用呼吸 dots。
  - 无蓝色 focus ring。
- 检查插画：单色 1.5px 描边，无 3D/等距/Memoji。
- 检查动效：卡片入场 240ms ease-out，Agent thinking 1.4s 呼吸，FAB 点击 scale 0.96。

**验证**：

- 输出 `docs/visual-audit.md`，列出每个页面的检查项与结果，标注问题与修复状态。
- 团队负责人或被指派人审阅通过。

**止血**：

- 如果问题过多，按影响主流程的程度排序，先修 Today / A2A / Summary 三屏。
- 不要以"Demo 可以凑合"为由保留明显违背反原则的项。

---

### 步骤 P9-02：真机适配测试

**目标**：在真实设备上验证小程序。

**动作**：

- 准备测试设备：iPhone（iOS 微信）与 Android（安卓微信）各一台。
- 测试流程：登录 → Onboarding → Today → Match Card → A2A → Summary → 分享公开页。
- 检查：安全区、字体加载、动画流畅度、轮询耗电、长文本换行、 dark mode 下是否异常（系统 dark mode 不应影响 Pair 浅色主题）。
- 记录问题到 `docs/qa-report.md`。

**验证**：

- 核心流程在两台设备上都能跑通。
- 没有阻塞性 crash 或白屏。
- QA 报告已归档。

**止血**：

- 如果某设备动画严重卡顿，关闭该设备的 translateY 动画或降低呼吸光晕。
- 如果字体加载失败，确保系统 fallback 能立即显示。

---

### 步骤 P9-03：编写用户文档与 Demo 脚本

**目标**：让团队能演示产品并 onboarding 新成员。

**动作**：

- 更新根目录 `README.md`：项目结构、本地启动命令、环境变量说明、部署链接。
- 创建 `docs/demo-script.md`：Demo 话术、操作路径、预期展示效果、失败 fallback。
- 创建 `docs/onboarding-dev.md`：新成员如何安装、运行、调试三端。
- 不编写面向终端用户的帮助文档（Agent 自己说话就是 onboarding）。

**验证**：

- 新成员（或你自己换一台机器）按 `docs/onboarding-dev.md` 能在 30 分钟内跑起三端。
- Demo 脚本覆盖 Today → A2A → Summary 的核心亮点。

**止血**：

- 如果某些步骤文档无法写清（例如需要内网 VPN），在文档中标注"需额外权限"。
- 不要等代码完全稳定才写文档；文档与代码同步迭代。

---

## 10. 全局止血原则

无论执行到哪一步，出现以下情况必须立即停止并报告：

1. **技术栈变更**：如果团队要求改用 Taro / uni-app / Python / MySQL 等 `memory-bank/tech-stack.md` 备选方案，先回到 P1-01 更新 `decisions.md`，再按新选型重新初始化对应模块。
2. **设计原则冲突**：任何实现如果违反 `memory-bank/design-document.md` 七、八节的反原则（例如拟人 Agent、渐变紫、蓝色 focus ring），必须回退或修改。
3. **安全合规风险**：发现公开档案暴露邮箱/电话、JWT Secret 泄露、API 未鉴权、用户数据未授权抓取时，立即停止并修复。
4. **依赖无法安装或启动崩溃**：不要绕过工具链继续写代码，先让工具链可用。
5. **LLM 输出不可控**：如果 A2A 输出出现辱骂、隐私泄露、明显不符合职场场景的内容，停止上线并加强 prompt 与 redact。

---

## 11. 完成定义

本实施计划全部完成的标准：

- [ ] 小程序能完整跑通：登录 → Onboarding → Today → Match → A2A Dialogue → A2A Summary。
- [ ] Web 公开档案页 `pair.app/u/{slug}` 可访问、可分享、OG image 正确。
- [ ] 后端 API 部署到云端，数据库/Redis/健康检查正常。
- [ ] 所有核心页面通过视觉一致性 audit。
- [ ] 真机测试通过（iOS + Android 微信）。
- [ ] CI/CD 能自动 build 与部署 Web/后端，小程序能自动上传体验版。
- [ ] `docs/` 中包含更新的 README、API 契约、视觉 audit、QA 报告、Demo 脚本、onboarding 文档。

---

*基于 memory-bank/design-document.md v0.1.1 与 memory-bank/tech-stack.md 制定*
