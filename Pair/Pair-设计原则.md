# Pair · 设计原则（v0.1）

> 目的：给设计 / 工程一个可以照着干的视觉与交互基线。
> 借鉴优先级：**Tana**（结构 / 命令面板 / 节点感）＋ **Claude.com**（温度 / 字体 / 思考感）＋ **Things 3**（克制的温暖）。
> 不要变成：脉脉、LinkedIn、Tara、任何"渐变紫太空感 AI 产品"。

---

## 一、设计哲学

### 三句话定调

1. **克制的温暖（Restrained Warmth）**：足够冷静以显得专业，足够温暖以降低社交尴尬。
2. **工具的尊严（Tool's Dignity）**：Pair 是工作时间打开的产品，不是消磨时间的产品。所有 UI 都该传达"你是认真的"。
3. **Agent 在场但不抢戏（Present, Not Performative）**：Agent 必须被感知到——它在工作、在思考、在替你打理事——但它不演戏，不卡通，不拟人。

---

## 二、十条核心原则

| # | 原则 | 应用方式 |
|---|---|---|
| **1** | **温度从字体来，不从颜色来** | 用 Fraunces 衬线做 Agent 发言和卡片标题；颜色保持中性克制 |
| **2** | **信息密度低于 LinkedIn，高于 Apple** | 主屏一屏 3–5 张卡，不堆 10+；不留大片空白 |
| **3** | **Agent 永远在说话** | 没卡片时也要有 Status Pulse；空状态是 Agent 状态 |
| **4** | **键盘优先，鼠标补位** | 所有动作都有快捷键；命令面板 ⌘K 是入口 |
| **5** | **节点 / 引用一等公民** | Supertag 体系（#cofounder #mentor）让人和目标可被引用、跳转、聚合 |
| **6** | **卡片是信件，不是数据行** | 每张卡有头、有体、有签名感，不是 Excel 的一行 |
| **7** | **拒绝炫技动效** | 不用 Liquid Glass、不用 parallax、不用 hero video；只用 subtle 呼吸和入场 fade |
| **8** | **暖色 accent 只用在 Agent 相关元素** | 琥珀色专属于 Agent 的"声音"——头像点、Agent 消息标识、Agent 高亮 |
| **9** | **拒绝拟人形象** | Agent 是几何符号，不是头像、不是 avatar、不是机器人 emoji |
| **10** | **dark 模式延后** | Phase 2 才做；Phase 1 单光环境，把一个主题做透 |

---

## 三、设计基因来源（具体拿什么）

### 从 Tana 拿（结构 / 交互范式）

| Tana 的能力 | Pair 怎么用 |
|---|---|
| **Supertag 系统** | 用 #cofounder #mentor #peer #ai-pm #投资人 标记 objective 和人，可点击聚合 |
| **命令面板 ⌘K** | 全局唯一入口，覆盖所有 slash 命令 + @人 + #tag 引用 |
| **节点感 / Reference popover** | 文字流里 hover 任何 #tag 或 @人，弹出该实体的上下文摘要 |
| **键盘优先** | j/k 滚卡片、Enter 打开 drawer、Esc 关闭、/ 触发命令、@ 选人、# 加 tag |
| **冷静密度** | 信息层级清晰，不靠装饰区分内容 |
| **空状态即内容** | 没数据时给引导和示例，绝不"画个 illustration 说欢迎" |

### 从 Claude.com 拿（温度 / 思考感）

| Claude.com 的能力 | Pair 怎么用 |
|---|---|
| **Fraunces 衬线** | Agent 发言 + 卡片 hero 标题用衬线，产生"对话 / 书信"质感 |
| **暖色基底** | 米白底 + 木质琥珀 accent，不用 indigo / 紫 |
| **思考节奏** | Agent "thinking" 状态用 1.4s 呼吸圆点，不用 spinner |
| **极简首屏** | 入口干净，复杂度藏在 ⌘K 后面 |

### 从 Things 3 / Read.cv 拿（克制 + 人味）

| 能力 | Pair 怎么用 |
|---|---|
| **纸质卡片感** | 1px subtle border + 微 elevation，不靠 shadow 撑立体 |
| **充足留白但不空** | 内 padding 16–20，卡间距 12，单列 720px max-width |
| **可读性优先** | 正文 15px / 行高 1.55，字号不下 12 |
| **职业但有人味** | 文案语气像同事，不像客服话术 |

### 明确不要变成什么

- ❌ 脉脉（信息过载、广告、廉价）
- ❌ LinkedIn（蓝色企业 SaaS 感）
- ❌ Tara / Replika（拟人化、可爱、温度过头变腻）
- ❌ Notion AI 的"星星图标 + 渐变紫"（已经是 cliché）
- ❌ Linear（太冷、太键盘党、缺温度）

---

## 四、视觉系统

### 4.1 色彩

**基底（中性暖色系）**

| Token | Hex | 用途 |
|---|---|---|
| `--bg-base` | `#FBFAF7` | 全局背景，"米白纸感" |
| `--bg-raised` | `#FFFFFF` | 卡片背景 |
| `--bg-sunken` | `#F4F2EC` | 输入框 / 二级容器 |
| `--bg-overlay` | `rgba(26,24,22,0.4)` | drawer / modal 遮罩 |

**前景**

| Token | Hex | 用途 |
|---|---|---|
| `--fg-primary` | `#1A1816` | 正文 / 主标题（不用纯黑） |
| `--fg-secondary` | `#5C5852` | 次要文字、metadata |
| `--fg-tertiary` | `#8B8680` | 占位符、disabled |
| `--fg-inverse` | `#FBFAF7` | 暗背景上的文字 |

**边框**

| Token | Hex | 用途 |
|---|---|---|
| `--border-subtle` | `#EDE9E0` | 默认 |
| `--border-default` | `#D6D1C7` | hover / 强调 |
| `--border-strong` | `#1A1816` | 选中态 / focus ring |

**Accent（专属于 Agent）**

| Token | Hex | 用途 |
|---|---|---|
| `--accent` | `#C68B5C` | Agent 头像、Agent 消息边、主按钮 |
| `--accent-dark` | `#8F6240` | hover / pressed |
| `--accent-soft` | `#F5E8D8` | Agent 消息背景填充（subtle） |
| `--accent-glow` | `rgba(198,139,92,0.18)` | Agent thinking 时的呼吸光晕 |

**语义色（克制使用，永不饱和）**

| Token | Hex | 用途 |
|---|---|---|
| `--success` | `#6B8E5A` | 接受、完成 |
| `--warning` | `#C49B3D` | 待处理、稀缺资源提示 |
| `--danger` | `#B85450` | 拉黑、删除、错误 |

**铁律**：
- 不用 indigo / violet / electric blue
- 不用 Tailwind 默认调色板（特别是 -400 / -500 系列）
- 所有色值走 token，禁硬编码 hex

---

### 4.2 字体

**字体栈**

```css
--font-serif: "Fraunces", "Source Serif Pro", Georgia, serif;
--font-sans: "Inter", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
--font-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;
```

**字号档（只用这 6 档）**

| Token | px | line-height | 用途 |
|---|---|---|---|
| `--text-xs` | 12 | 1.5 | metadata、timestamp |
| `--text-sm` | 13 | 1.5 | 次要正文、按钮 |
| `--text-base` | 15 | 1.55 | 正文 / Agent 发言 |
| `--text-md` | 18 | 1.45 | 卡片标题 |
| `--text-lg` | 24 | 1.3 | 屏标题 |
| `--text-xl` | 32 | 1.2 | Hero（仅 Onboarding） |

**字体用法**

| 场景 | 字体 | 字号 |
|---|---|---|
| Agent 发言（thread 里） | Fraunces serif | 15 |
| 用户发言 | Inter sans | 15 |
| 卡片标题（人名 / 事件名） | Fraunces serif 500 | 18 |
| 卡片正文 / metadata | Inter sans | 13–15 |
| Supertag / chip | Inter mono 字符 + sans | 12 |
| Slash command 提示 | JetBrains Mono | 12 |
| 按钮 | Inter sans 500 | 13 |
| Hero（仅 Onboarding） | Fraunces serif italic | 32 |

**铁律**：
- Agent 说话永远用衬线，用户说话永远用无衬线——视觉区分对话双方
- 不用 9 px 字体
- 不用 7 档以上字号
- 中文环境下衬线 fallback 到 PingFang SC（不要强用衬线中文）

---

### 4.3 间距 / 网格

**基础单位**：`4px`

**间距档**

```
--space-1: 4
--space-2: 8
--space-3: 12
--space-4: 16
--space-5: 20
--space-6: 24
--space-8: 32
--space-10: 40
--space-12: 48
--space-16: 64
```

**布局**

| 区域 | 规格 |
|---|---|
| 主内容区（Thread） | 单列，max-width 720px，居中 |
| 卡片内 padding | 16 / 20（视卡型） |
| 卡片间距 | 12 |
| 屏幕左右 margin | mobile 16，desktop 24+ |
| Drawer 宽度 | 380px，固定 |
| Composer 高度 | 56–80（动态） |
| Header 高度 | 52 |

---

### 4.4 圆角

| 元素 | radius |
|---|---|
| 卡片 | 12 |
| 按钮 / 输入框 | 8 |
| Tag / Chip / Supertag | 6 |
| Agent 头像 / 几何符号 | 50%（圆） |
| Modal / Drawer | 16（左上 / 右上 only） |

**铁律**：不用 24px+ 大圆角（过于"消费品"），也不用 0–2px（过于"开发工具"）。

---

### 4.5 阴影 / 立体

**几乎不用 box-shadow**。立体感靠 border + 微 elevation。

```css
--shadow-card: 0 1px 0 rgba(26,24,22,0.04);
--shadow-elevated: 0 4px 16px rgba(26,24,22,0.06), 0 1px 0 rgba(26,24,22,0.04);
--shadow-drawer: -4px 0 24px rgba(26,24,22,0.08);
--ring-focus: 0 0 0 2px var(--accent);
```

**铁律**：
- 卡片默认无 shadow，hover 时上 `--shadow-card`
- Drawer / Modal 用 `--shadow-elevated`
- focus 一律用 `--ring-focus`（琥珀），不用浏览器默认蓝框

---

### 4.6 动效

**时长**

| Token | ms | 用途 |
|---|---|---|
| `--duration-fast` | 120 | hover、active 状态切换 |
| `--duration-base` | 200 | 卡片入场、切换 |
| `--duration-slow` | 320 | Drawer / Modal 进出 |

**曲线**

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**关键动效规格**

| 场景 | 规格 |
|---|---|
| 卡片入场 | opacity 0→1 + translateY(8px→0), 200ms, `--ease-out` |
| Agent "thinking" | 呼吸圆点 opacity 0.4↔1.0, 1.4s, infinite |
| Agent "typing" | 闪烁光标 1s 周期 |
| 按钮 hover | 仅 bg 变化, 120ms |
| Drawer 进 | translateX(100%→0), 320ms, `--ease-out` |
| Tab / 命令面板切换 | 无动效，instant |
| Toast / 提示 | 滑入 + fade, 200ms |

**铁律**：
- 禁 parallax、禁 scroll-jacking
- 禁 hover 缩放 (`transform: scale`)
- 禁全屏过渡动画

---

## 五、Tana 借鉴的具体落地

### 5.1 Supertag 系统

**视觉**：圆角矩形 chip，#符号是 mono 字体，文字是 sans。

```
┌─────────────┐
│ #cofounder  │   bg: --accent-soft, text: --accent-dark
└─────────────┘   radius: 6, padding: 2 8
```

**核心 supertag 库**（V1）：

- 角色类：`#cofounder` `#mentor` `#mentee` `#peer` `#investor` `#advisor`
- 行业类：`#ai-pm` `#design` `#engineering` `#growth` `#bd` `#ops`
- 阶段类：`#student` `#early-career` `#manager` `#director` `#founder`
- 状态类：`#open-to-chat` `#hiring` `#fundraising` `#exploring`

**交互**：
- 输入 `#` 在 composer 唤起 supertag picker
- 点击 supertag → 跳到 "所有 #xxx 的人 / 匹配" 聚合页
- Hover supertag → popover 显示该 tag 下当前活跃的人数和最近 3 个 match

---

### 5.2 命令面板（⌘K）

**结构**

```
┌──────────────────────────────────────────┐
│ 🔍 搜索 / 命令 / 人                       │
├──────────────────────────────────────────┤
│ 最近                                      │
│   /find 做出海支付的 PM                   │
│   @Sarah Chen                            │
├──────────────────────────────────────────┤
│ 命令                                      │
│   /find    在用户池找符合描述的人          │
│   /pair    主动发起 outreach              │
│   /draft   重写当前 Match 的开场白         │
│   /why     让 Agent 解释推荐理由           │
│   /skip    教 Agent 忽略某类信号           │
│   /quiet   静音 N 小时                    │
├──────────────────────────────────────────┤
│ 人                                        │
│   @Sarah Chen     Stripe Senior PM       │
│   @Daniel Liu     Anthropic              │
├──────────────────────────────────────────┤
│ Tag                                       │
│   #ai-pm   12 active                     │
│   #cofounder  4 active                   │
└──────────────────────────────────────────┘
```

**铁律**：
- ⌘K 全局唯一入口，永远可唤起
- 模糊匹配（fuzzy search）
- 最近使用置顶
- Esc 关闭

---

### 5.3 节点感 / Reference Popover

任何文字流里的 `#tag` 或 `@人名`，hover 后 200ms 浮出 popover：

- 对 `#cofounder`：显示当前所有 cofounder 匹配 + 数量
- 对 `@Sarah Chen`：显示 Sarah 的档案缩略 + 你们的互动历史 + 一个"打开 drawer"按钮

**铁律**：popover 不抢焦点，点击才打开 drawer。

---

### 5.4 键盘优先

| 快捷键 | 行为 |
|---|---|
| `⌘K` | 命令面板 |
| `⌘/` | 显示所有快捷键 |
| `j` / `k` | 上下滚 thread 卡片 |
| `Enter` | 打开当前 focused 卡的 drawer |
| `Esc` | 关闭 drawer / 命令面板 |
| `/` | composer 里触发 slash 命令 |
| `@` | composer 里触发人选择 |
| `#` | composer 里触发 tag 选择 |
| `⌘Enter` | composer 提交 |
| `⌘[` / `⌘]` | drawer 前 / 后切换 |

---

### 5.5 空状态即内容

**禁**：放一张 illustration + "暂无数据"。

**做**：Agent 用一段衬线对话告诉你它在做什么 / 你能做什么。

例：
> "今天还没扫到值得推的人。我正在监测 47 位你关注的对象，下一轮 2 小时后。
> 也可以现在直接告诉我你想见谁——⌘K 或 `/find`。"

---

## 六、关键组件规格

### 6.1 Card · 标准卡

```
┌─────────────────────────────────────────────────┐
│ ● Match · 2 hours ago                    [···] │   头部：metadata + 操作
│                                                 │
│  Sarah Chen                                     │   主标题：Fraunces 18
│  Senior PM @ Stripe · San Francisco             │   副标题：sans 13, fg-secondary
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Why ta:                                  │   │
│  │ Both #ai-pm, both exploring early-stage  │   │   reasoning block:
│  │ AI startups. She just left a big tech    │   │   bg-sunken, 15 serif
│  │ infrastructure team — similar to your    │   │
│  │ Moonshot trajectory.                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ Agent drafted:                           │   │   draft preview:
│  │ "Hi Sarah, your transition from infra    │   │   accent-soft bg, serif
│  │ to product really resonates. I'm at..."  │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [ Send invite ]   [ Rewrite ]   [ Pass ]      │   actions: 主按钮 + 次按钮
└─────────────────────────────────────────────────┘
```

**规格**：
- bg: `--bg-raised`
- border: 1px solid `--border-subtle`
- radius: 12
- padding: 20
- 卡间距: 12

---

### 6.2 Agent Visual · 几何符号

**禁**：拟人头像、机器人 emoji、虚拟人 avatar。

**用**：一个 14×14px 的圆，渐变填充。

```
渐变：linear-gradient(135deg, #C68B5C 0%, #8F6240 100%)
thinking 时：外发光 4px var(--accent-glow), 1.4s 呼吸
```

放置位置：
- Agent 发言前一个 14px 圆
- Composer 左侧（提示这是和 Agent 对话）
- Onboarding hero 左下角

---

### 6.3 Composer

```
┌─────────────────────────────────────────────────┐
│ ● Ask the agent, or use /,  @,  #           ⏎ │
└─────────────────────────────────────────────────┘
   ^                                             ^
   Agent 圆点                                  ⌘+Enter
```

**规格**：
- 高度：56（单行）/ 80–120（多行自适应）
- bg: `--bg-raised`
- border: 1px solid `--border-default`
- focus: `--ring-focus`
- placeholder: `--fg-tertiary`，italic serif

---

### 6.4 Drawer · 360px 抽屉

**结构（从上到下）**：

1. 头：返回 + 人名 + 关闭
2. 档案 hero：头像 + 名字（Fraunces 24）+ title
3. 关键 supertag（#chip 横排）
4. Why now 块（Agent 一段话，serif，bg-sunken）
5. Suggested topics（3 条建议聊点）
6. History（最近 5 次互动 timeline）
7. 底部固定 action bar：[Draft]  [Edit profile]

**规格**：
- 宽度：380（固定）
- bg: `--bg-raised`
- border-left: 1px solid `--border-subtle`
- shadow: `--shadow-drawer`

---

### 6.5 Tag / Chip

如 5.1 所述。三种变体：

| 类型 | bg | text | 用途 |
|---|---|---|---|
| Supertag | `--accent-soft` | `--accent-dark` | #cofounder 等 |
| Neutral | `--bg-sunken` | `--fg-secondary` | "Stripe""San Francisco" 等普通标签 |
| Status | 见语义色 | 配套 | "Accepted""Pending" |

---

### 6.6 Button

**三档**

| 类型 | bg | text | 用途 |
|---|---|---|---|
| Primary | `--fg-primary` (近黑) | `--bg-base` | 主 CTA："Send invite" |
| Secondary | transparent + border `--border-default` | `--fg-primary` | "Rewrite" |
| Ghost | transparent | `--fg-secondary` | "Pass" |

**铁律**：
- 同一张卡上 ≤ 1 个 primary
- 主按钮不用 accent 琥珀色（accent 留给 Agent）
- icon-only button 必须有 `aria-label`

---

## 七、反原则（永远不做的事）

| 不做 | 理由 |
|---|---|
| 渐变紫 / 电光蓝 | 已经是 AI 产品 cliché，让 Pair 立刻显得"廉价 demo" |
| Liquid Glass / 厚 blur | 炫技；和"工具的尊严"相反 |
| 拟人 Agent / 机器人形象 | Agent 不演戏；这是和 Tara 的根本切割 |
| 大量 emoji | 职业感掉光 |
| Hover scale 动效 | 让卡片像广告 banner |
| Spinner | 用呼吸圆点，传达"思考"而非"加载" |
| 蓝色 focus ring | 用琥珀 ring |
| Tailwind 默认调色板 | 走 token，禁硬编码 |
| 全屏 hero video / illustration | 入口要干净，复杂藏在 ⌘K 后 |
| 9 px 字体 | 可读性破产 |
| Toast 3s+ | 提示 1.5s 自动消失 |
| Dark mode（Phase 1） | 先把一个主题做透 |

---

## 八、可执行参考

### 落地顺序建议

1. **建 token 系统**（color + space + radius + duration）→ 一份 `tokens.css` / `tokens.ts`
2. **建字体载入 + 排版基线**（Fraunces 变量字体 + Inter）
3. **建 4 个底层组件**：Card / Button / Tag / Composer
4. **建 Agent visual 组件**（圆点 + thinking 状态）
5. **建命令面板**（独立组件，全局挂载）
6. **建 Today 流容器**（卡片 stream + j/k 导航）
7. **建 Drawer**
8. **走通 Onboarding 5 屏**

### 工具链建议

- **Figma 文件结构**：Foundations / Components / Patterns / Screens 四个 page
- **Token 输出**：用 Tokens Studio 同步 Figma → CSS / TS
- **字体托管**：Fraunces 用 Google Fonts，Inter 用 rsms.me 自托管
- **图标**：Lucide React（已在 CoffeeChat Agent 项目里）
- **A11y**：所有交互元素必须可键盘到达 + 有 aria-label

### 参考链接

- Tana：tana.inc — 看 supertag、command palette、节点交互
- Claude.com：claude.com — 看字体节奏和暖色基底
- Things 3：culturedcode.com/things — 看克制的温暖
- Read.cv：read.cv — 看职业但有人味
- Fraunces：fonts.google.com/specimen/Fraunces — 主衬线

---

## 文档版本

- v0.1（M0）：本文，初版基线。
- v0.2 计划：Figma 落地 + 真实截图后回填具体组件 spec。
- v1.0 计划：Phase 1 上线后，根据真实使用反馈固化。
