# Pair UI / UX Specification

> 版本：v0.2 · 2026-06-30
> 用途：基于 `demo.png` 和 `design-document.md` 补全 MVP 页面、组件、状态与交互逻辑。
> 主载体：微信小程序。Web 仅负责公开档案页与后续登录辅助页。

## 1. Experience Principle

Pair 的体验不是“聊天工具”，而是“Agent 工作台”：

- 用户把目标交给 Agent。
- Agent 先理解用户，再替用户找到值得认识的人。
- 双方 Agent 先完成一轮结构化对齐。
- 用户最后只判断：是否值得真人见面。

界面要克制、安静、有纸感。避免强社交 feed、即时聊天压迫感、机器人拟人化。

## 2. Global Navigation

小程序底部 4 个 Tab：

| Tab | 路由 | 说明 |
|---|---|---|
| Today | `/pages/today/index` | 今日匹配和主工作台 |
| People | `/pages/people/index` | 已建立/进行中的连接 |
| Chats | `/pages/chats/index` | Phase 1 可展示 A2A 记录入口，不做真人聊天 |
| Me | `/pages/me/index` | 我的档案、设置、公开页 |

Phase 1 默认入口：

```text
未登录 -> Login
已登录但无 profile -> Onboarding
已登录且有 profile -> Today
```

## 3. Visual Rules

- 背景使用 token `bgBase`。
- 卡片使用 `bgRaised`、细边框、弱阴影。
- 主按钮使用近黑 `fgPrimary`，不使用 accent 背景。
- accent 主要用于 Agent 圆点、进度、选中态、重要数字和链接。
- Agent 说话使用衬线字体，用户操作和 UI 文案使用无衬线。
- 所有交互元素最小点击区域 44px。
- 不使用彩色机器人头像、3D 插画、紫色 AI 星星。

## 4. Core Components

### AgentDot

用途：代表 Agent 的存在。

状态：

- `idle`: 14px 琥珀渐变圆点。
- `thinking`: 圆点带 1.4s 呼吸光晕。
- `done`: 圆点静止，可附带完成文本。
- `error`: 圆点保持克制，旁边显示错误文案，不变成红色大警告。

### Button

类型：

- `primary`: 黑底白字，用于“微信一键登录”“下一步”“发出”“安排见面”。
- `secondary`: 白底边框，用于“改写”“我先看看”。
- `ghost`: 纯文字，用于“不感兴趣”“返回”。
- `icon`: FAB、返回、更多、关闭。

规则：

- 主要页面最多一个 primary。
- destructive 操作用 ghost 或 secondary + 确认，不直接大红按钮。

### MatchCard

内容：

- 候选人姓名、headline、可选头像。
- supertags。
- `Why ta`: 匹配理由。
- `Agent drafted`: 开场白预览。
- 操作：`发出`、`改写`、`Pass`。

状态：

- `ready`: 可操作。
- `rewriting`: 改写按钮 loading，卡片不可重复提交。
- `sending`: 发出中，跳转 A2A 预览前显示轻量 loading。
- `expired`: 置灰，主按钮变“已过期”。
- `passed`: 从列表移除或折叠为短 toast。

### ProgressBar

用于 A2A 预计进度和 Onboarding 抓取进度。

规则：

- 进度条用 accent。
- 不使用旋转 spinner。
- 估时文案可以是“预计还要 45 秒”。

### SummaryCard

优先级：

1. 对齐度数字。
2. 一句话核心判断。
3. 对方眼中的你。
4. 你眼中的对方。
5. 可聊话题。
6. 风险提示。
7. CTA。

## 5. Onboarding Flow

### Screen 1: Login

目标：让用户进入产品。

布局：

- 标题：“每个职场人都有一个 Agent”
- 副标题：“帮你看人、破冰、初步对齐”
- 手绘箭头 / Agent 圆点。
- Primary：“微信一键登录”
- Secondary：“用 Google 登录”
- Ghost：“已有账号？登录”

交互：

- 点击微信登录 -> 调用 `wx.login` -> `/auth/wechat-login`。
- 成功后检查 `/me`。
- 无 profile -> Screen 2。
- 有 profile -> Today。

错误：

- 微信授权失败：toast “登录失败，请重试”。
- 网络失败：保留当前页，按钮恢复。

### Screen 2: Add Identity

目标：让用户提供公开资料。

布局：

- 标题：“让你的 Agent 先读懂你”
- 说明：“30 秒内基于你的公开资料生成一份档案，你可以改任意字段”
- 输入框 placeholder：“粘贴你的 LinkedIn / 小红书 / 个人主页 URL”
- 可选 textarea：“或粘贴一段介绍”
- Primary：“让 Agent 读”

交互：

- URL 和 pastedText 至少一个非空。
- 点击后调用 `POST /profiles/generate`。
- 成功 -> Screen 3。

错误：

- 输入为空：输入框下方提示。
- URL 无法读取：允许用户继续粘贴文本，不阻塞流程。

### Screen 3: Agent Reading

目标：展示 Agent 正在抓取和提炼。

布局：

- 标题：“这是 Agent 看到的你”
- Agent 圆点和扫描线插画。
- 任务列表：
  - “正在分析公开内容...”
  - “正在提炼你的关键标签...”
  - “构建中...”
- ProgressBar。

交互：

- 每 2 秒轮询 `GET /profiles/generate/:jobId`。
- `succeeded` -> Screen 4。
- `failed` -> 错误态，提供“重新尝试”和“我手动填写”。

### Screen 4: Profile Preview

目标：用户确认 Agent 生成的档案。

布局：

- 标题：“这是 Agent 看到的你”
- Profile card:
  - 姓名
  - headline
  - tags
  - bio
- 每个字段旁提供编辑入口。
- Primary：“下一步”
- Secondary：“改一改”

交互：

- 点击字段进入 inline edit 或底部 drawer。
- 保存前校验 name/headline/bio 非空。
- 点击下一步先保存 `POST /profiles`，再进入 Screen 5。

### Screen 5: Objectives

目标：选择 1 到 3 个当前目标。

布局：

- 标题：“你想用 Pair 找什么样的人？”
- 目标卡片列表：
  - “想聊创业”
  - “想找 mentor”
  - “跨界打听”
  - “找联创”
- 选中态使用 accent border + accentSoft 背景。
- Primary：“下一步”

交互：

- 最少选 1 个，最多选 3 个。
- 超过 3 个时 toast：“最多先选 3 个目标”。
- 点击下一步调用 `PUT /objectives`。

### Screen 6: A2A Mode

目标：设置 Agent 对话偏好。

布局：

- 标题：“Agent 和对方 Agent 谈的时候，你想...”
- 单选卡片：
  - “托付型 · 推荐”
  - “参与型”
- 默认选中托付型。
- Primary：“完成注册”

交互：

- 保存到 `/settings`。
- 成功后进入 Today。

## 6. Today

目标：让用户每天看到少量高质量匹配。

布局：

- Header：“下午好，jingfei”
- Agent 状态：“Agent 找了 247 人，3 位值得你下一轮 14:00”
- 今日匹配区域。
- MatchCard 列表，最多 3 张。
- 底部 tab。
- 右下 FAB 可触发刷新或快速目标调整。

状态：

### Loading

- 展示 AgentDot thinking。
- 文案：“Agent 正在看今天适合你认识的人”。
- 不显示骨架屏堆叠。

### Empty

- 手绘空态插画。
- 文案：“今天还没找到值得推荐的人”
- 次文案：“下一轮 14:00，也可以调整你想见的人”
- CTA：“调整目标”

### Ready

- 显示 MatchCard。
- 卡片主动作：
  - “发出”：调用 `/matches/:id/send`，跳转 A2A。
  - “改写”：调用 `/matches/:id/rewrite-intro`。
  - “Pass”：调用 `/matches/:id/pass`，卡片移出。

错误：

- Match 加载失败：保留页面，显示“重试”。
- 单张卡片操作失败：只影响该卡片，不刷新整页。

## 7. Match Detail Drawer

触发：点击 MatchCard 非按钮区域。

内容：

- 候选人头像 / 姓名 / headline。
- 完整 tags。
- Why now。
- 共同点。
- Agent draft。
- 操作按钮。

交互：

- 从右侧或底部抽屉进入，保留 Today 上下文。
- 点击遮罩关闭。
- 点击发出后关闭 drawer 并进入 A2A。

## 8. A2A Preview

目标：让用户看到 Agent 正在替自己做第一轮对齐，但不把它做成聊天。

布局：

- Header：返回 + 状态。
- 标题：“双方 Agent 正在对齐”
- 估时：“预计 1-2 分钟”
- 进度：“两个 Agent · 5 轮对齐 · 第 2 轮”
- 消息预览卡：
  - “我的 Agent”
  - “Sarah 的 Agent”
- Thinking 状态。
- ProgressBar。
- Secondary：“截停对话”
- Ghost：“切换到参与型”

交互：

- 进入页面后每 2 秒轮询 `GET /a2a/:sessionId`。
- 每新增消息，timeline 轻微淡入。
- `completed` 且有 `summaryId` -> 自动进入 Summary，也允许用户点击。
- 点击“截停对话” -> 二次确认 -> `/a2a/:sessionId/abort`。

失败：

- 对话失败：展示错误态。
- CTA：“重试” -> `/a2a/:sessionId/retry`。
- CTA：“回到 Today”。

## 9. Collaborative A2A

Phase 1 可先隐藏入口，但交互逻辑保留。

流程：

1. Agent 生成草稿。
2. 用户看到草稿卡。
3. 用户选择：
   - “发出”
   - “编辑后发出”
   - “我来写”
   - “跳过这轮”
4. 超过 24 小时未处理，自动切回托付型或标记超时。

规则：

- 草稿不等于已发送消息。
- 用户编辑后的消息 source 为 `user_edited`。
- 用户完全接管的消息 source 为 `user_takeover`。

## 10. Summary

目标：帮助用户判断是否值得真人见面。

布局：

- 顶部状态：“对齐完成”
- 对齐度：大数字 `8 / 10`
- 核心判断：“都在 early-stage AI，目标重叠度高”
- “你眼中的 Sarah”
- “Sarah 眼中的你”
- 可聊话题 chips / cards。
- 风险提示，如果无风险则不显示。
- Primary：“安排见面”
- Secondary：“我先看看”
- Ghost：“不感兴趣 · 看完整对话”

交互：

- “安排见面”：Phase 1 显示 bottom sheet “排期功能开发中”，可收集意向。
- “我先看看”：回到 People 或保留 Summary。
- “不感兴趣”：二次确认后调用 `/summaries/:id/not-interested`。
- “看完整对话”：展开 A2A message timeline，但默认收起。

## 11. People

目标：展示连接关系，而不是社交通讯录。

Tabs：

- `已建立`
- `潜在`
- `历史`

列表项：

- 头像 / 手绘默认头像。
- 姓名、headline。
- 当前关系状态：
  - A2A 进行中
  - Summary 已完成
  - 已安排见面
  - 已结束

交互：

- 点击人 -> People Detail Drawer。
- 若 A2A running -> 进入 A2A Preview。
- 若 Summary done -> 进入 Summary。

## 12. People Detail Drawer

内容：

- 候选人资料。
- Why ta。
- 建议话题。
- 过往 A2A 摘要。
- 操作：
  - “发出 Invite”
  - “我先想想”

规则：

- Drawer 内不嵌套卡片套卡片。
- 保持信息密度，但不做聊天入口。

## 13. Public Profile H5

目标：用户可分享自己的 Pair 身份卡。

布局：

- 顶部品牌：“Pair”
- 右上：“登录 / 加入”
- 手绘边框档案卡。
- 头像或手绘人像。
- 姓名、headline。
- tags。
- bio。
- “我想用 Pair 聊”目标列表。
- Primary：“让 Agent 帮我介绍你”
- QR code / invite code。

交互：

- 未登录访客点击 CTA -> 登录或申请加入。
- 本人访问时显示“编辑公开页”。
- 未发布页面返回 404 或私密提示。

## 14. Settings

列表项：

- 我的档案
- 我的 objectives
- A2A 模式偏好
- 通知设置
- 屏蔽列表
- 隐私设置
- 关于 Pair
- 退出登录

交互：

- 每项进入独立页面或 bottom sheet。
- “退出登录”必须二次确认。

## 15. Feedback Card

Phase 2 使用。

布局：

- 标题：“会后反馈卡”
- 问题：“见到了吗？”
- 评分 1-5 星。
- 标签选择。
- textarea。
- Primary：“提交反馈”

规则：

- score 必填。
- comment 可选，但低分时建议填写。

## 16. Empty / Error States

### Today Empty

文案：

- 主文案：“今天还没找到值得推荐的人”
- 次文案：“下一轮 14:00，也可以调整你想见的人”

CTA：

- 调整目标
- 手动刷新

### Load Failed

文案：

- “加载失败，请检查网络后重试”

CTA：

- 重试
- 返回首页

### A2A Failed

文案：

- “这轮 Agent 对话没有完成”
- “你可以重试，或先回到 Today”

CTA：

- 重试
- 返回 Today

## 17. Interaction Timing

| 场景 | 时长 / 频率 |
|---|---|
| 卡片入场 | 240ms |
| Drawer 进出 | 360ms |
| Agent thinking 呼吸 | 1400ms |
| Profile 生成轮询 | 2s |
| A2A 轮询 | 2s |
| Toast 展示 | 2s |

## 18. MVP Page Priority

开发顺序：

1. Login
2. Onboarding Add Identity
3. Profile Preview
4. Objectives
5. Today
6. Match Detail Drawer
7. A2A Preview
8. Summary
9. Public Profile H5
10. People
11. Settings
12. Empty / Error states

Phase 1 验收标准：

- 用户能从登录完成建档。
- 用户能看到至少一张 Match Card。
- 点击“发出”后进入 A2A Preview。
- A2A 完成后看到 Summary。
- 公开档案页可通过 slug 访问。
