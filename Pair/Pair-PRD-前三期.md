# Pair · 前三期 PRD（v0.2）

> v0.2 重大调整：
> 1. **A2A Dialogue + Summary 从 Phase 2 提前到 Phase 1 P0**——用户的硬要求。Phase 1 必须能演完整 A2A 闭环
> 2. **删除所有小红书产品集成**——小红书 = 资助方 + 加速器，不是产品上游。Pair 是独立产品形态
> 3. 注册方式：email / 微信 / Google（不再小红书 OAuth）
> 4. 12 月战略指标重写为纯产品指标（不再"贡献小红书核心指标"）
> 5. 增加 A2A v1 详细 spec + Onboarding 详细 spec（为 8/5 demo 服务）

复用资产：当前 `cf agent 0627` 仓库（CoffeeChat Agent v0.5，单用户跑通）。
关联文档：[Memo OnePage]、[Roadmap]、[设计原则]、[Demo 冲刺计划]。

---

## 0. 三期总览

| 期 | 时间 | 代号 | 一句话 | 北极星 |
|---|---|---|---|---|
| **Phase 1** | M0–M3 | **Pair 0.1 · A2A 核心闭环** | 注册 → Match → **A2A 真聊** → Summary → 决定见 → 排期 | **5K 注册 / A2A 完成率 ≥ 80% / Summary → 真见 ≥ 30%** |
| **Phase 2** | M4–M8 | **Pair 1.0 · 智能化 + 场景扩展** | A2A 智能化（自适应轮数、用户插话）+ 主动 outreach + 4 场景 + 垂类社群 | **3 万注册 / 1 万 WAU·c / 累计 5 万次真见** |
| **Phase 3** | M9–M12 | **Pair 1.5 · 网络效应 + 商业化验证** | B2B POC + 数据飞轮 + 跨场景扩展 + 单位经济建模 | **5 万注册 / 10 万累计真见 / M+3 留存 ≥35% / 1 个 B2B POC** |

每期闸门写在该期 PRD 末尾，闸门没过不进下一期。

---

## 1. 产品定位与不变量

### 1.1 目标用户（V1 限定）

22–35 岁，AI / 互联网 / 产品 / 设计 / 工程 / 咨询行业的早中期职场人，有明确 networking 动机（找下家、找联创、找 mentor、跨界打听、求行业信息）。

**反向定义（不服务）**：找对象 / 单纯找工作 / 公司内部 networking / 高净值私董会。

### 1.2 不变量（贯穿三期）

1. **AI 是手段，人是关系**——所有 A2A 对话最终目标是促成真人 1:1
2. **三段式护栏**——A2A 对齐 → 用户预览/批准 → 人接管
3. **Agent 是同事不是 chatbot**——主屏永远是 Agent 工作成果，零打字
4. **不做泛社交、不做情感陪伴**——所有交互都挂在明确动词目标上
5. **不做 mock 数据**——任何阶段没真用户就不上线对应模块
6. **完全独立产品形态**——不集成任何母公司 App（小红书 / Kimi / 任何其他）的内部能力

### 1.3 交互第一性原理

继承 CoffeeChat Agent 的 Today 流：
- 主屏只有一条线，卡片流
- 永不空白（Agent 在工作的 status 永远在顶部）
- 每张卡独立 fetch / 独立 retry
- ⌘K 命令面板是 power user 捷径，不是主入口

---

## 2. 复用 vs 新增（vs 现有 CoffeeChat Agent）

| 模块 | 现状 | Phase 1 处理 | Phase 2/3 演进 |
|---|---|---|---|
| Today 流 | ✅ 已建 | 直接用，新增 Match Card / A2A Dialogue Status / Summary Card | 新增 Outreach Card / Reconnect Card |
| People | ✅ CRUD 已建 | 改名 "My Connections" | 加 connection 图谱 |
| Discovery | ✅ 扫已知联系人动态 | **升级为 Match Engine**：在用户池里跑双向撮合 | 跨场景撮合 |
| /draft /find /skip /quiet | ✅ slash 已建 | 复用 + 新增 /why | + /pair（主动 outreach）/ /preview / /abort |
| DeepSeek 链路 | ✅ 已建 | 加 prompt：撮合判断、开场白生成、**A2A 编排**、**Summary 生成** | + A2A 自适应、redact LLM 二审 |
| DB 模型 | ✅ 单用户 | 扩展：User↔User、Match、Intro、**Dialogue、Summary**、Meeting、Feedback | + Outreach、Community、ReconnectReminder |
| 登录 | ✅ Kimi OAuth | **改造**：email / 微信 / Google 三选一（删 Kimi、不加小红书 OAuth）| + 企业邮箱 SSO（B2B） |
| Settings | ✅ | 区分"Agent 偏好"+"Pair 公开档案" | 加 community 管理 |
| **新增 · Pair 公开档案** | ❌ | **P0**：每个用户的分享页 | 多场景档案 |
| **新增 · Match 引擎** | ❌ | **P0**：跨用户池双向撮合 | + 主动 outreach 撮合 |
| **新增 · A2A Orchestrator** | ❌ | **P0**：后端编排双方 Agent 5 轮对话 | + 自适应轮数、用户插话 |
| **新增 · A2A Summary 生成** | ❌ | **P0**：LLM 提炼对齐摘要 | + 多场景 prompt |
| **新增 · Acceptance 流** | ❌ | **P0**：双方接受 / 排期 / 反馈 | + 自动召开 |

---

# Phase 1 PRD · Pair 0.1 "A2A 核心闭环"

## 1.1 期目标

把现有单用户 CRM 工具改造为**最小双边 A2A 平台**——能完整跑完"注册 → Match → A2A 真聊 → Summary → 决定见 → 排期 → 见面 → 反馈"全闭环。

**关键决策**：Phase 1 就要做 A2A 真聊，不是 Phase 2 才做。理由：
- A2A 是 Pair 的灵魂功能，没它 Pair 退化为 Lunchclub 复刻
- 8/5 demo 必须能演 A2A 闭环
- 早做的复杂度 = 5 轮固定槽位（不是 Phase 2 的自适应多轮）——可控

## 1.2 用户旅程（Happy Path）

### 注册（≤ 5 分钟）

1. **登录屏**：email 或微信或 Google 三选一
2. **添加身份**：粘贴 LinkedIn / 小红书主页 / 个人站任一 URL
3. **Agent 抓取生成 v0 档案**：DDG snippet 抓取 + DeepSeek 提炼，30 秒内出
4. **档案预览**：用户改 / 确认
5. **objectives 选择**：4–6 个互补成对选项，选 1–3 个
6. **频次与时段**：每周想要的 coffee chat 次数 + 偏好时段
7. 进 Today 屏 → Agent 在顶部说"我已经在为你扫描合适的人，第一批匹配预计 24 小时内"

### 主循环

**触发**（每周一 9:00 cron + 用户当天 active 时增量触发）：Agent 在用户池里跑撮合 → 推 1–3 张 Match Card 到 Today。

**Match Card 上的动作**：
- 用户看到对方公开档案摘要 + Agent 写的"为什么是 ta" + Agent 起草的开场白
- 三按钮：[ Send invite ]  [ Rewrite ]  [ Pass ▾ ]（Pass 下拉 4 选项：公司不感兴趣 / 时段不对 / 都不是 / 永不推此人）

**用户点 Send invite**：
- 对方收到 Today 推送 + 邮件提醒
- 对方看到的卡：你的档案摘要 + 你的开场白 + 为什么 Agent 推你给 ta
- 对方接受 / pass

**双方都接受后 → A2A Dialogue 阶段（核心新增）**：
- 双方 Today 流出现 **Dialogue Status Card**：
  > "● 两个 Agent 正在替你们对齐意向，预计 1–2 分钟。可以截停。"
- 后端 Orchestrator 自动跑 5 轮 A2A 对话（详见 1.4 节）
- 完成后 → 双方 Today 流出现 **A2A Summary Card**

**Summary Card 上的动作**：
- 用户看到：
  - 对方眼中的你（一段摘要）
  - 你眼中的对方（一段摘要）
  - 3 条可聊话题
  - 对齐度评分 0–10 + 一句解释
  - 风险提示（可选）
- 三按钮：[ 安排见面 ]  [ 我先看看再决定 ]  [ Pass ]

**双方都点"安排见面"**：
- 进排期：双方各选 3 个时段交集 → 自动生成腾讯会议 / Google Meet 链接
- 见面前 1 小时 Agent 推 reminder

**见面后 24 小时 → 反馈卡**：
- 见到了吗？打分 1–5 + 一句话标签（很有帮助 / 一般 / 想再聊 / …）
- 反馈进数据飞轮

---

## 1.3 P0 功能列表（M0–M2 必须）

| ID | 功能 | 描述 | 验收 |
|---|---|---|---|
| F1.1 | **多渠道注册** | email + 微信 + Google 三选一 | 三个渠道都能完成注册 |
| F1.2 | **Agent 自动建档** | 任一 URL → DDG snippet + DeepSeek 提炼 → v0 档案 | LinkedIn / 小红书 / 个人站任一可用 |
| F1.3 | **objectives 选择器** | 互补成对的目标选择 | 选完后 DB 写入 + 撮合池更新 |
| F1.4 | **Match Engine v1** | 跨用户池跑双向撮合 | 周一 9:00 + 增量触发；每个活跃用户至少出 1 张卡 |
| F1.5 | **Match Card UI** | Today 流核心卡类型 | 档案 + 为什么 + 开场白 + 三按钮（含 Pass 下拉） |
| F1.6 | **Agent 开场白生成** | 基于双方档案 + objective 个性化 | 同一组合两次生成应有差异；≤100 字 |
| F1.7 | **接受流** | 用户点接受 → 对方收到推送 | 推送通过 Today 流 + 邮件双通道 |
| F1.8 | **A2A Orchestrator v1** | 后端编排双方 Agent 5 轮对话 | 见 1.4 节详细 spec |
| F1.9 | **A2A Dialogue Status Card** | A2A 进行中的 UI | 显示进度 + 截停按钮 |
| F1.10 | **A2A Summary 生成** | LLM 总结成 Summary Card | 4 块内容（对方摘要 / 你的摘要 / 3 话题 / 评分） |
| F1.11 | **A2A Summary Card UI** | Today 流新卡类型，Pair 标志性 UI | 见 1.5 节 |
| F1.12 | **排期流** | 双方都点安排见面后自动排时段 | 三选一时段；自动生成会议链接 |
| F1.13 | **会后反馈** | 24h 后推送反馈卡 | 收到打分 + 标签写 DB |

## 1.4 A2A v1 详细 spec（新增章节，最关键）

### 触发条件

双方都点 Match Card "Send invite" / "接受" 后，自动启动 A2A Dialogue。

### 机制

**输入**（Orchestrator 给两个 Agent 各自加载）：
- 自己的：完整公开档案 + 当前 objective + 用户给自己 Agent 的指令（"特别想问 ta 的 X"，可选）
- 对方的：公开档案 + 对方的公开 objective（**不包含**对方给自己 Agent 的私有指令）

**对话结构**：固定 5 轮，每轮一方说一次（共 10 条消息），4 个槽位驱动：

| 轮 | 说话方 | 内容指令（prompt 模板） |
|---|---|---|
| 1 | 发起方 Agent | 自我介绍 + 当前在做的事（≤200 字） |
| 2 | 接收方 Agent | 自我介绍 + 当前在做的事（≤200 字） |
| 3 | 发起方 Agent | 我的 objective 是 X，看你的背景觉得你能在 Y 方面提供帮助；同时我能提供 Z |
| 4 | 接收方 Agent | 回应：你的 objective 我能帮 / 不能帮的部分 + 我自己也想了解 W |
| 5 | 发起方 Agent | 总结共识 + 提议见面 / 或建议跳过 |

每轮 ≤ 200 字。总对话 1–2 分钟（DeepSeek 异步调用，前端 polling）。

### Summary 生成

完成 5 轮后，调一次 LLM 生成 Summary，结构化输出（4 字段）：

```json
{
  "your_view_of_them": "...",        // 80 字摘要，给发起方看
  "their_view_of_you": "...",        // 80 字摘要，给接收方看
  "topics": ["...", "...", "..."],   // 3 条可聊话题
  "alignment_score": 8,              // 0-10
  "score_reason": "...",             // 一句解释
  "risk_note": null                  // 可选风险提示
}
```

### 护栏 v1

| 护栏 | 实现 |
|---|---|
| **用户随时可截停** | Dialogue Status Card 上有"截停"按钮 → state 转 aborted → 不生成 Summary |
| **事后可查全文** | 用户可在 dialogue 详情页看 Agent 对话原文 |
| **基础 redact** | 正则匹配手机号 / 邮箱 / 身份证号自动替换为 `[联系方式已屏蔽]` |
| **失败兜底** | 任一轮 LLM 调用失败 → 整次 dialogue state 转 failed → 通知双方，提供"重试一次"按钮 |
| **超时控制** | 单轮 LLM 超时 30s 算失败；总对话超时 5 分钟强制终止 |

### Phase 1 A2A v1 **不做**的事

- ❌ 自适应轮数（固定 5 轮）
- ❌ 用户实时插话（截停可，插话 Phase 2 才做）
- ❌ 多人 A2A（3+ 方）
- ❌ LLM 二次 redact（Phase 2 才做语义 redact）
- ❌ A2A 失败后自动重新撮合

## 1.5 Onboarding 详细 spec（新增章节，为 demo 服务）

### 5 屏 + 加载态

**屏 1 · 登录**
- Hero：Fraunces 衬线 "每个职场人都有一个 AI Agent 替你筛人、破冰"
- 三按钮：[ 用 email 注册 ] [ 微信登录 ] [ Google 登录 ]
- 底部："已有账号 → 登录"

**屏 2 · 添加身份**
- 标题："让你的 Agent 先读懂你"
- 输入框：placeholder "粘贴你的 LinkedIn / 小红书 / 个人主页 URL"
- 副文案："30 秒内 Agent 会基于你的公开发文构建一个 v0 档案，你可以改任何字段"
- 按钮：[ 让 Agent 读 ]

**屏 3 · Agent 抓取中（加载态）**
- 大字 Fraunces "Agent 正在读你..."
- Agent 圆点呼吸动画
- 副文案："正在分析 12 篇内容..." / "正在提炼你的关键标签..." / "构建中..."
- 进度条 30s

**屏 4 · 档案预览**
- 标题（Fraunces）"这是 Agent 看到的你"
- v0 档案展示：
  - 头像（如有）+ 姓名（可改）
  - 一句话身份："Senior PM at Stripe · San Francisco"（可改）
  - 关键标签（chips）：#ai-pm #early-stage #design-systems（可加/删）
  - 一段 bio（80 字，可改）
- 底部：[ ✓ 看起来对，进入下一步 ] [ 让 Agent 重新读 ]

**屏 5 · objectives 选择**
- 标题："你想用 Pair 找什么样的人？"
- 副文案："选 1–3 项，之后随时可改"
- 4–6 张 chip 卡（互补成对）：
  - 我想聊创业 ↔ 我想聊职业转型
  - 我想找 mentor ↔ 我想 mentor 别人
  - 我想跨界打听 ↔ 我在某行业愿意分享
  - 我想找联创 ↔ 我想加入早期团队
- 底部：[ 完成注册 ]

**完成后**：进 Today 屏，Agent 顶部 status："● 我已经在为你扫描合适的人 · 第一批匹配预计 24 小时内 · 你也可以现在 ⌘K 主动发起"

## 1.6 数据模型（Phase 1 扩展）

```
users (现有扩展)
  + auth_provider              # email | wechat | google
  + auth_provider_id
  + pair_profile_url           # slug
  + pair_profile               # JSON: v0 档案
  + objectives                 # JSON: [{kind, side}]
  + meeting_quota_per_week
  + preferred_time_slots
  + invite_code (nullable)

matches (新)
  id, created_at
  user_a_id, user_b_id
  objective_kind
  score
  reason                       # Agent 生成的 why
  state                        # pending|a_accepted|b_accepted|both_accepted|dialogue_running|dialogue_done|scheduled|done|rejected

intros (新)
  id, match_id
  generated_at
  text                         # 开场白
  variant                      # professional|casual|story
  is_active

dialogues (新 - Phase 1 P0)
  id, match_id
  state                        # pending|running|completed|aborted|failed
  total_rounds                 # 默认 5
  started_at, completed_at

dialogue_messages (新 - Phase 1 P0)
  id, dialogue_id
  round
  speaker_agent_user_id
  content
  redacted_spans               # JSON

summaries (新 - Phase 1 P0)
  id, dialogue_id
  your_view_of_them
  their_view_of_you
  topics                       # JSON
  alignment_score
  score_reason
  risk_note (nullable)
  generated_at

meetings (新)
  id, match_id
  scheduled_at, meeting_url
  state                        # scheduled|done|cancelled

feedback (新)
  id, meeting_id, user_id
  score, tags, comment, submitted_at
```

## 1.7 P1 功能（M2–M3）

| ID | 功能 | 描述 |
|---|---|---|
| F1.14 | Pair 公开档案分享页 | 每用户一个 URL，分享获取邀请 |
| F1.15 | /换开场白 | 用户不满意时让 Agent 重写（3 风格变体） |
| F1.16 | /why @ta | 让 Agent 解释推荐理由 |
| F1.17 | /skip <信号> | 教 Agent 忽略某类匹配 |
| F1.18 | /quiet N小时 | 静音通知 |
| F1.19 | 每日 Status Pulse | Agent 报告"我今天扫了多少人" |
| F1.20 | 黑名单 / 屏蔽 | 主动拉黑 |
| F1.21 | Dialogue 详情页 | 用户可查看 A2A 对话全文 |

## 1.8 P2 功能（M3 视情况）

- F1.22 邀请制 / 等待名单
- F1.23 周日复盘卡（Weekly Digest）
- F1.24 用户给自己 Agent 的"前置指令"（"特别想问 ta 的 X"）

## 1.9 非功能性需求

| 类别 | 要求 |
|---|---|
| **性能** | Match Engine 单次跑完用户池 < 5 分钟（M3 时 ≤ 5000 用户）；A2A 5 轮对话 < 2 分钟 |
| **可用性** | 单卡失败不影响 Today 流其他卡；A2A 失败可手动重试 |
| **隐私** | 公开档案不含手机号 / 邮箱；A2A 对话基础 redact |
| **响应时间** | Today 流首屏 < 1.5s；Match Card 加载 < 500ms |
| **合规** | 抓取走公开数据 + 用户授权；A2A 用于训练 opt-out |

## 1.10 Go / No-Go 闸门（M3 末判）

**进入 Phase 2 必须同时满足**：

| 指标 | 目标 | 失败动作 |
|---|---|---|
| 累计注册用户 | ≥ 5,000 | 推迟 Phase 2 一个月，调档案抓取质量 |
| 双方接受率（双方都点接受 / 总 Match Card）| ≥ 25% | 同上 |
| **A2A 完成率（完成 5 轮无截停 / 无技术错误）** | ≥ 80% | 回头调 Orchestrator 稳定性 |
| **Summary → 真见转化率** | ≥ 30% | 回头调 Summary 质量 + UI |
| 会后反馈 ≥ 4 分占比 | ≥ 50% | 调撮合算法 |
| P0 隐私 / 安全事故 | 0 | 一票否决 |

---

# Phase 2 PRD · Pair 1.0 "智能化 + 场景扩展"

## 2.1 期目标

A2A 从固定 5 轮升级为智能化；coffee chat 单场景扩展到 4 类连接；垂类社群上线；启动主动 outreach。

## 2.2 核心新增

### A. A2A v2 智能化

| 能力 | 描述 |
|---|---|
| **自适应轮数** | 5–15 轮，由 Orchestrator 根据对齐度自动终止 |
| **用户实时插话** | 进行中可在 composer 加 prompt（"特别问 ta 对 X 的看法"），Orchestrator 注入 |
| **语义 redact v2** | LLM 二次校验 PII + 商业敏感 + 不当言论 |
| **场景化 prompt** | coffee chat / 找联创 / mentor / 找"做过 X 的人" 各一套 prompt |

### B. 主动 Outreach (/pair)

- 用户在 composer 输入 "/pair 帮我找做过出海支付的 PM"
- 后端跑 Outreach Pipeline：解析意图 → 在用户池里筛 10–30 候选 → Agent 向他们的 Agent 推送 Outreach Request
- 接收方 Today 流出现 Outreach Card（区别于自动 Match Card）
- 接收方点接受 → 进 A2A Dialogue（同 Phase 1 流程）

### C. 垂类社群

- 4 个种子垂类：AI PM / 设计师 / 创业者 / 港大校友
- 用户可加入多个；撮合在社群内优先
- 跨社群匹配开关（用户可选"只匹配本社群"或"全局"）

### D. 二次 Follow-up Agent

- 见过的对方，N 周（默认 8 周）后 Agent 提示是否再约
- 不强推，只在 Today 流出现 Reconnect Card

## 2.3 P0 功能（M4–M5）

| ID | 功能 |
|---|---|
| F2.1 | A2A v2 自适应轮数 Orchestrator |
| F2.2 | 用户实时插话注入机制 |
| F2.3 | 语义 redact pipeline（LLM 二审） |
| F2.4 | 场景化 prompt 库 v1（4 套） |
| F2.5 | /pair 命令 + Outreach Pipeline |
| F2.6 | Outreach Card UI |
| F2.7 | 4 个垂类社群上线 + 加入流 |

## 2.4 P1 功能（M5–M7）

| ID | 功能 |
|---|---|
| F2.8 | 跨社群匹配开关 |
| F2.9 | Agent 培训页（用户填风格偏好） |
| F2.10 | 二次 follow-up Agent + Reconnect Card |
| F2.11 | Connection 图谱可视化（在 People 页） |
| F2.12 | 用户公开档案的多场景版本（同一人，不同场景不同档案） |

## 2.5 P2 功能（M7–M8）

| ID | 功能 |
|---|---|
| F2.13 | 多人 A2A（3 方对齐撮合） |
| F2.14 | A2A 后自动 follow-up（会前 reminder + 会后感谢） |
| F2.15 | 见面 agenda 协商（Agent 间商定 1h 真见的议程） |

## 2.6 数据模型增量

```
outreach_requests
  id, requester_user_id
  prompt, parsed_filters
  state                      # pending|running|completed
  created_at

communities
  id, name, description, is_invite_only
  created_at

community_memberships
  user_id, community_id, joined_at, role

reconnect_reminders
  id, user_id, target_user_id, suggested_at, state
  trigger                    # 8w_since_last_meeting | event_based

dialogues (扩展 v2)
  + max_rounds               # 自适应：5-15
  + early_terminated         # bool: Orchestrator 提前结束
  + user_injections          # JSON: 用户实时插话内容
```

## 2.7 Go / No-Go 闸门（M8 末判）

| 指标 | 目标 |
|---|---|
| 累计注册 | ≥ 30,000 |
| WAU·c | ≥ 10,000 |
| A2A → 真见转化率 | ≥ 35% |
| A2A 被用户截停 / 投诉率 | ≤ 5% |
| 至少 3 个垂类社群每周 ≥ 10 次匹配 | ✅ |
| 累计完成真 coffee chat | ≥ 50,000 次 |
| PMF 信号"如果今天 Pair 倒了你会很失望吗"答"非常" | ≥ 40% |

---

# Phase 3 PRD · Pair 1.5 "网络效应 + 商业化验证"

## 3.1 期目标

按用户约束，**Phase 3 不收 C 端付费**。但要验证商业化可行性：B2B POC + 单位经济建模 + 数据飞轮启动。

## 3.2 核心新增

### A. B2B 白标 POC

选 1 个早期 VC 或孵化器（如真格、险峰、Founder Park）做 pilot：
- 免费给被投 / 入选项目用 Pair
- 3 个月 pilot 期：跟踪撮合数 / 留存 / 价值证明
- **目标**：产出可写在融资 deck 里的 case study；为 Phase 4 商业化奠基

### B. 数据飞轮 + 模型微调（offline）

- 累计 ≥ 50,000 A2A 对话
- 数据脱敏 pipeline 上线（PII 去除 + 用户匿名）
- 基于脱敏数据训练专属 networking LLM v0（DeepSeek/通义/智谱开源版微调）
- A/B 测试 vs DeepSeek 通用版

### C. 跨场景扩展

- 私董会 / 小组撮合（3–5 人小局）
- 国际化探索（英文 prompt + 海外用户池）

### D. 单位经济建模

即使不收钱，也要算清楚：
- 单用户 LLM 调用成本（API + token）
- 单次撮合成本
- 假设未来收 Pro ¥69/月，LTV / CAC 模型
- 为下一轮融资准备

## 3.3 P0 功能（M9–M10）

| ID | 功能 |
|---|---|
| F3.1 | Workspace 概念引入（多租户基础） |
| F3.2 | B2B 客户子域名 + 白标 logo / 配色 |
| F3.3 | Admin 后台（成员、看板、设置） |
| F3.4 | 批量邀请 / 批量导入成员 |
| F3.5 | 数据隔离（客户社群内 vs 公共池） |

## 3.4 P1 功能（M10–M11）

| ID | 功能 |
|---|---|
| F3.6 | 数据脱敏 pipeline |
| F3.7 | 微调训练 pipeline（offline） |
| F3.8 | A/B 框架（新模型 vs 旧模型） |
| F3.9 | 多人撮合 v2（小组配对） |
| F3.10 | 英文版 prompt + UI 国际化基础 |

## 3.5 P2 功能（M11–M12）

| ID | 功能 |
|---|---|
| F3.11 | 单位经济 dashboard |
| F3.12 | 用户付费意愿调研入口（in-product survey） |
| F3.13 | 邀请奖励机制（被邀请人完成首次 A2A 奖励邀请人） |

## 3.6 数据模型增量

```
workspaces
  id, name, slug, branding (JSON)
  contract_state, contact_email

workspace_memberships
  user_id, workspace_id, role, joined_at

unit_economics_snapshots
  date, user_count, api_cost, avg_dialogues_per_user, ...
```

## 3.7 Go / No-Go 闸门（M12 末判 · 12 月总闸门）

| 指标 | 目标 |
|---|---|
| 累计注册 | ≥ 50,000 |
| WAU·c | ≥ 10,000 稳定 |
| 累计真 coffee chat | ≥ 100,000 次 |
| M+3 月留存 | ≥ 35% |
| **至少 1 个 B2B POC 跑通 + case study 已写** | ✅ |
| 单位经济模型已建立（可估算 LTV / CAC 上限） | ✅ |
| P0 合规事故 | 0 |

---

## 4. 跨期数据模型演进总览

```
Phase 1 (P0):
  users(扩展)、matches、intros、dialogues、dialogue_messages、summaries、meetings、feedback

Phase 2 (新增):
  outreach_requests、communities、community_memberships、reconnect_reminders
  dialogues 扩展 v2（自适应轮数、用户插话）

Phase 3 (新增):
  workspaces、workspace_memberships、unit_economics_snapshots
```

## 5. 关键技术决策（影响 UI 与工程）

| 决策 | 影响 |
|---|---|
| **A2A 真聊在 Phase 1** | UI 必须有 Dialogue Status + Summary Card；后端必须有 Orchestrator |
| Today 流仍是主屏 | UI 围绕 thread + cards，不引入 navigation 复杂度 |
| 所有匹配 / 对话异步 | 需要 push / polling 机制；Today 流 60s 自动刷新 |
| A2A 对话是 batch（非 streaming） | 用户看到的是"思考中"+"完成"，不是逐字流 |
| 不做原生 App（Phase 1–2） | Web responsive；Phase 3 视情况上小程序 |
| 邮件 + Web 推送双通道 | 同一事件可能两个渠道都发，需去重 |
| **不集成任何母公司 App 内部能力** | 注册 / 数据 / 推送 / 支付完全独立 |

## 6. 风险与缓解（PRD 视角）

| 风险 | Phase | 概率 | 影响 | 缓解 |
|---|---|---|---|---|
| **A2A 对话质量不可控** | 全期 | 高 | 极高 | 三段式护栏 + redact + 抽审 + 用户截停 |
| Agent 开场白生成出错 | P1 | 高 | 中 | 3 档预生成 + 必须 preview |
| 用户档案不准 | P1 | 高 | 高 | 用户必须 review + 版本化可回滚 |
| 撮合质量差 churn | P1 | 中 | 高 | 反馈闭环每周迭代算法 |
| **A2A 失败率高（>20%）** | P1 | 中 | 高 | 兜底重试 + 渐进降级到"Agent 起草双方都看的桥接邮件" |
| 冷启动用户池太小 | P1 | 高 | 高 | 限定 3 垂类社群（AI PM / 创业者 / 港大校友），不做泛人群 |
| Lunchclub / 大厂入场 | 全期 | 低 | 高 | A2A 范式护城河 + 12–18 月窗口期 |
| B2B POC 找不到客户签约 | P3 | 中 | 中 | M6 就启动 BD，多线并跑 |

## 7. 留给你拍板的开放问题

| # | 问题 | 我的建议 |
|---|---|---|
| Q1 | A2A v1 固定 5 轮够吗，还是 3 轮起步？ | **5 轮**。3 轮可能不够展开；7 轮以上质量飘 |
| Q2 | 注册时强制要 URL，还是可选？ | **强制**。没 URL 档案质量太差，撮合 = 灾难 |
| Q3 | 邀请制第一天就上？ | **是**。强化"被 Agent 认可才能进"叙事 |
| Q4 | Pair 公开档案默认对谁可见？ | 仅 Match 后双方可见；分享链接公开 |
| Q5 | 4 个垂类社群是哪 4 个？ | AI PM / 创业者 / 港大校友 + 1 个待定（设计师 vs 出海 vs 其他，看种子分布） |
| Q6 | A2A Summary 评分公开给双方还是只给发起方？ | **双方都看**。透明度优于不对称 |
| Q7 | 见面记录公开吗？ | 不公开。仅双方可见 |
| Q8 | B2B POC 优先打哪类客户？ | 早期 VC（决策快、case study 强、口碑传播好） |

## 8. 下一步：UI 打磨阶段输入

PRD 完成后，UI 打磨需要按顺序输出：

1. **Onboarding 5 屏 hi-fi**（直接决定注册转化）
2. **Today 主屏 hi-fi**（卡片混合：Match Card + Dialogue Status + Summary Card）
3. **Match Card 状态机**（所有 state 的 UI）
4. **A2A Dialogue Status Card**（进行中的 UI）
5. **A2A Summary Card**（Pair 的标志性 UI，最重设计投入）
6. **Drawer**（人详情页）
7. **Settings**（Agent 偏好 + objectives 编辑 + 屏蔽列表）

---

## 文档版本

- v0.1（M-1）：初稿。A2A 在 Phase 2。
- **v0.2（6/30）：本版**。A2A 提前到 Phase 1 P0；删除小红书集成；补 A2A v1 详细 spec 与 Onboarding 详细 spec。
- v0.3 计划：UI 打磨完成后回填 UI 状态机和交互细节。
- v1.0 计划：M3 末 Phase 1 结束复盘版。
