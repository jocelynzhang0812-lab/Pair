# Pair · 产品设计文档（memory-bank/design-document.md）

> 版本 v0.1.1（2026-06-30 · accent 保留 70%）
> 实施载体：**微信小程序为主** + 独立 web 公开档案页（pair.app/u/xxx）
> 美学参考：**圆周旅迹**（克制的中文衬线 + 大圆角卡片 + 手绘线条插画）+ Nosh（待补截图后细化）
> 美学方向：**克制减法**——近乎黑白、衬线扛气质、手绘扛温度、Agent 在场不抢戏
> 关联文档：[Pair 设计原则 v0.1]（被本文档替代为执行基线）、[PRD v0.2]、[Demo 冲刺计划]

---

## 一、设计哲学

### 三句话定调

1. **克制的温暖 v2**：圆周旅迹证明了"几乎黑白也可以很有温度"——温度从字体的衬线感、手绘插画的人味、文案的语气来，不从色彩饱和度来。
2. **工具的尊严**：Pair 是工作时间打开的产品。任何 UI 都不该让人觉得"幼稚"或"toC 娱乐"。
3. **Agent 在场但不抢戏**：Agent 必须被感知到——它在工作、在思考、在替你打理事——但它不演戏、不卡通、不拟人。Agent 视觉 = 一个 14px 圆点 + 微动效。

### 与圆周旅迹的对齐点

| 圆周旅迹的做法 | Pair 借鉴 |
|---|---|
| 近乎黑白配色（背景米白 / 文字近黑 / 极少 accent）| **采纳**。accent 仅 Agent 头像点 |
| 粗体中文衬线做 Hero（"行程计划"） | **采纳**。中文 Hero 用思源宋体 / 鸿蒙宋体 |
| 大圆角卡片（≈18px）+ 半透明背景 | **采纳**。Pair 卡片圆角 16–20 |
| Outline 描边 chip（不是填充） | **采纳**。所有 chip / tag 走 outline |
| 手绘线条插画（空状态、引导） | **采纳**。Pair 自建 6–8 张手绘插画 set |
| 圆形黑色 FAB（右下角） | **采纳**。Pair 的"主动 outreach" CTA |
| 极少 emoji，关键处 1-2 个点缀 | **采纳**。功能性 emoji 只用在 supertag |

### 不能像圆周旅迹的地方

- 圆周旅迹是**旅行 / 内容消费工具**，气质偏"生活感"。Pair 是**职场 connection 工具**，气质要更"专业一点"。所以：
  - 减少 emoji 使用（圆周旅迹 chip 上有 ☁️ 🏔️，Pair 不用 emoji 在 supertag）
  - 减少粉嫩 accent，Agent 头像点用木质琥珀（暖灰偏褐），而不是粉/橙
  - 手绘插画风格要更"精炼"，而不是"可爱"

---

## 二、视觉系统

### 2.1 色彩（修订版 v0.2.1）

**铁律**：accent（木质琥珀）保留 70% 使用面——比纯"近乎黑白"更暖一点。**Agent 相关元素是 accent 的核心载体，但 focus ring / 重要链接 / 选中态 / 进度条 / 数字强调也可用**。主按钮仍走近黑色，不被 accent 抢主位。

**基底**

| Token | Hex | 用途 |
|---|---|---|
| `--bg-base` | `#F7F5F0` | 全局背景，"米白纸感"，比圆周旅迹略暖一点点 |
| `--bg-raised` | `#FFFFFF` | 卡片背景 |
| `--bg-sunken` | `#EFECE5` | 输入框 / 二级容器 / chip 内填 |
| `--bg-card-glass` | `rgba(255,255,255,0.6)` | 半透明大卡（参考圆周旅迹） |
| `--bg-overlay` | `rgba(20,18,16,0.4)` | drawer / modal 遮罩 |

**前景**

| Token | Hex | 用途 |
|---|---|---|
| `--fg-primary` | `#141210` | 正文 / 主标题（不用纯黑，近黑） |
| `--fg-secondary` | `#6B655E` | 次要文字、metadata |
| `--fg-tertiary` | `#A39E96` | 占位符、disabled |
| `--fg-inverse` | `#F7F5F0` | 暗背景上的文字（主按钮内文字） |

**边框**

| Token | Hex | 用途 |
|---|---|---|
| `--border-subtle` | `#EAE6DD` | 默认 |
| `--border-default` | `#D5CFC2` | hover / 强调 |
| `--border-strong` | `#141210` | focus ring / chip outline |

**Accent**（木质琥珀，70% 使用面）

| Token | Hex | 用途 |
|---|---|---|
| `--accent` | `#B68559` | Agent 头像点 / focus ring / selected chip 边框 / 进度条 / 关键链接文字 / Hero 关键词 highlight |
| `--accent-dark` | `#7F5C3B` | hover / pressed 态、A2A Summary 数字（对齐度 8/10 那个 "8"） |
| `--accent-soft` | `#F2E9DC` | A2A Dialogue Status Card 微背景 / Agent 起草开场白的浅底 / 当前 selected 卡的微 tint |
| `--accent-glow` | `rgba(182,133,89,0.18)` | Agent thinking 呼吸光晕 / focus halo |

**语义色**（克制使用）

| Token | Hex | 用途 |
|---|---|---|
| `--success` | `#5B7F4D` | 完成 / 双方都接受 |
| `--warning` | `#B5933E` | 提醒 |
| `--danger` | `#A94D49` | 拉黑 / 失败 |

**主按钮配色**：bg `--fg-primary` + text `--fg-inverse`（近黑底白字），不是 accent 色——主 CTA 的"权威感"靠黑。

**Accent 在 UI 中的具体落点清单**（70% 使用面落到这些地方）：

| 元素 | accent 用法 |
|---|---|
| Agent 头像 / 圆点 | 渐变填充（`--accent` → `--accent-dark`） |
| Agent thinking 状态 | 外发光呼吸（`--accent-glow`） |
| Focus ring（输入框、按钮、卡片选中态） | 2px `--accent` |
| Selected chip / Selected objective | border + text 用 `--accent`，bg `--accent-soft` |
| 链接文字（如"看完整对话""让 Agent 重新读"） | `--accent-dark` |
| Hero 中的关键词 highlight（如"对齐完成"的"完成"） | `--accent-dark`，可选 |
| 进度条（A2A 进行中、Onboarding 步骤指示） | `--accent` |
| A2A Summary 中的对齐度大数字 | `--accent-dark` |
| Agent 起草开场白的微底 | `--accent-soft` |
| 重要 outline 按钮（"约见 Sarah"那种次要主动 CTA） | border + text `--accent-dark` |
| 反馈卡上"很有帮助"标签的选中态 | `--accent-soft` bg |

**Accent 在 UI 中不应出现的地方**：
- ❌ Hero 大字主体（保持近黑）
- ❌ 主按钮背景（保持近黑）
- ❌ 卡片边框默认态（保持 `--border-subtle`）
- ❌ 顶部 nav / 全局背景

---

### 2.2 字体（修订版，强调中文衬线）

**字体栈**

```css
/* 中文衬线 — Hero / 卡片标题 / Agent 发言 */
--font-serif-cn: "Source Han Serif SC", "Noto Serif CJK SC",
                 "FZShuSong-Z01S", "STSongti-SC", serif;

/* 英文衬线 — 英文 Hero / 数字 */
--font-serif-en: "Fraunces", "Source Serif Pro", Georgia, serif;

/* 无衬线 — 正文 / UI */
--font-sans: "Inter", -apple-system, "PingFang SC",
             "Microsoft YaHei", sans-serif;

/* Mono — supertag # 前缀 / 时间 / 命令 */
--font-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;
```

**字号档（仅 6 档，微信小程序需要更大字号）**

| Token | px | line-height | 用途 |
|---|---|---|---|
| `--text-xs` | 12 | 1.5 | metadata / 时间 |
| `--text-sm` | 14 | 1.5 | 次要正文 / 按钮 |
| `--text-base` | 16 | 1.55 | 正文 / Agent 发言（小程序里比 web 大一档） |
| `--text-md` | 20 | 1.4 | 卡片标题 |
| `--text-lg` | 28 | 1.25 | 屏标题（Hero "Today" 之类） |
| `--text-xl` | 36 | 1.15 | Onboarding Hero（少用） |

**关键字体规则**

| 场景 | 字体 | 字号 | 字重 |
|---|---|---|---|
| Hero 中文（"今天的匹配"、"行程"） | 中文衬线 Serif CN | 28 | 700 粗体 |
| Hero 英文 / 数字（"3 matches today"） | Fraunces | 24 | 500 |
| 卡片标题（人名："Sarah Chen"） | Fraunces 500 / 中文衬线 600 | 20 | – |
| Agent 发言（"我看了 ta 的近期发文..."） | 中文衬线 Serif CN | 16 | 400 |
| 用户发言 / 操作反馈 | Inter sans | 14 | 500 |
| 正文 | Inter sans | 16 | 400 |
| metadata（时间、地点、tag） | Inter sans | 12 | 400 |
| Supertag chip 文字 | Inter sans | 12 | 500 |
| 按钮 | Inter sans | 14 | 500 |

**铁律**：
- Agent 说话永远用衬线，用户说话永远用无衬线——视觉区分双方
- 中文 Hero 必须粗体衬线，气质来源
- 不用 9px、不用 10px、不用 8 档以上字号

---

### 2.3 间距、圆角、阴影

**间距单位**：4px。常用：4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64

**布局**

| 区域 | 规格 |
|---|---|
| 小程序主屏宽 | 375 / 414（适配） |
| 主内容左右 margin | 16（小程序）/ 24（web） |
| 卡片内 padding | 20 |
| 卡片间距 | 12 |
| Composer 高度 | 64（小程序） |
| 顶部 status bar | 52（含微信原生导航） |

**圆角（按圆周旅迹改大）**

| 元素 | radius |
|---|---|
| 卡片 | **18**（之前 12，按圆周旅迹放大） |
| 按钮（圆角矩形） | 12 |
| Chip / Supertag | 14 / 100%（pill 形） |
| 输入框 | 12 |
| FAB（圆形） | 50% |
| Agent 头像 / 几何符号 | 50% |
| Modal / Drawer 顶部 | 20（左上 / 右上 only） |

**阴影**（几乎不用，靠 border + 微 elevation）

```css
--shadow-card: 0 1px 0 rgba(20,18,16,0.04);
--shadow-elevated: 0 6px 20px rgba(20,18,16,0.06), 0 1px 0 rgba(20,18,16,0.04);
--shadow-fab: 0 4px 12px rgba(20,18,16,0.18);
--shadow-modal: 0 -8px 32px rgba(20,18,16,0.10);
--ring-focus: 0 0 0 2px var(--accent);
```

---

### 2.4 插画系统（新增章节，关键）

**风格基线**：单色手绘线条（黑色 1.5px 描边）+ 偶尔一个色块点缀（accent 或 success 色）。

**用途场景**

| 场景 | 插画 |
|---|---|
| Onboarding 屏 2（添加身份） | 手机里跳出 LinkedIn / 小红书 / 个人站三个图标，类似圆周旅迹底部那张 |
| Onboarding 屏 3（Agent 抓取中） | 一个圆形 Agent 符号被三条线条"扫描"，简单几何 |
| Today 空状态 | 两个手绘小人对桌坐着 + 中间一个对话气泡 + Agent 圆点 |
| A2A Summary Card 顶部 | 两个 Agent 圆点之间一条流动线条（连接感） |
| Pair 公开档案 hero 区 | 用户名片样式的手绘边框 |
| Match 失败 / 0 结果 | 一个空白的对话气泡 + Agent 圆点举着一个 "?" |

**铁律**：
- **绝不用 3D / 等距插画 / Memoji** 风格（toC 娱乐感）
- **绝不用 Notion AI 的星星 emoji + 渐变紫** 那套
- 线条粗细统一 1.5px，圆角描边
- 优先单色（近黑），关键处可加一笔 accent

**首批要画的 8 张**（M0–M1）：

1. Onboarding · 添加身份页（手机 + 平台图标）
2. Onboarding · Agent 扫描中（Agent + 扫描线）
3. Today 空状态（两人对话 + Agent）
4. A2A Summary hero（双 Agent 连接）
5. Match 失败（Agent 举问号）
6. 公开档案 hero（名片边框）
7. 加载态（呼吸 dots）
8. 反馈卡 hero（两个杯子 + 对话）

---

### 2.5 动效

**时长**

| Token | ms | 用途 |
|---|---|---|
| `--duration-fast` | 120 | hover / active 切换 |
| `--duration-base` | 240 | 卡片入场 / 切换（小程序略慢一档） |
| `--duration-slow` | 360 | Drawer / Modal |

**曲线**

```css
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* 入场用 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* 状态切换 */
```

**关键动效规格**

| 场景 | 规格 |
|---|---|
| 卡片入场 | opacity 0→1 + translateY(12px→0)，240ms `--ease-out` |
| Agent thinking 圆点 | opacity 0.4↔1.0，1.4s 循环 |
| **A2A Dialogue 实时预览（核心）** | 双方 Agent 的发言一条一条出现，每条入场 240ms fade + 8px slide |
| 按钮 hover | bg 变化 120ms（无 transform） |
| FAB 点击 | scale(0.96)，120ms，回弹 |
| Drawer 进入 | translateX(100%→0) / translateY(100%→0)，360ms |
| Toast | 滑入 + fade，200ms；停留 1.5s；滑出 200ms |

**铁律**：禁 parallax、禁 scroll-jacking、禁 hover scale、禁 spinner（用呼吸 dots）

---

## 三、微信小程序实施约束

### 3.1 屏幕与导航

- 顶部默认有 ~44pt 微信原生导航栏（白色，含返回 + 标题）
- 自定义 navigationStyle = "custom" 可去掉，但要自己处理胶囊按钮位置
- 主屏宽 375pt（iPhone Standard），适配到 414pt
- 安全区底部 ~34pt（iPhone X+）

### 3.2 登录与授权

- 用 `wx.login` + 后端换 openid + unionid
- 用户档案（昵称、头像）需要授权（按钮触发 `getUserProfile`）
- **不要求**微信通讯录权限（敏感、过审风险）

### 3.3 分享

- 微信小程序自带"右上角 ... → 分享给朋友 / 朋友圈封面"
- 分享卡片必须自定义（含 Pair logo、邀请文案）
- "Pair 公开档案"分享时生成带 utm 的 H5 链接（跳到 pair.app/u/xxx 网页）

### 3.4 性能约束

| 项 | 限制 | 应对 |
|---|---|---|
| 主包体积 | 2 MB 上限 | 插画用 SVG inline、字体走 CDN |
| 分包 | 总 16 MB | 把 A2A / 公开档案这种二级页放分包 |
| 图片单张 | 建议 ≤ 200KB | 用户头像 / 档案图压到 WebP |
| 字体加载 | 网络字体可能闪烁 | Fraunces 主包内联子集，中文衬线用系统字体 fallback 优先 |

### 3.5 不能做的事

- ❌ 全屏 video / 自动播放（小程序受限）
- ❌ 复杂 SVG 动画（性能差，用 CSS keyframe 替代）
- ❌ 长连接 / WebSocket（仅特定 API，不适合 A2A 实时流）
- ✅ A2A 实时预览改用 **轮询**（1s 一次）或 **SSE 短连**

---

## 四、核心屏 UI Spec

### 4.1 Onboarding（5 屏 + 1 加载态）

**屏 1 · 登录**

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                                 │
│   每个职场人都有一个 Agent          │ ← 中文衬线，28px，2 行
│   替你筛人、破冰、初步对齐          │
│                                 │
│                                 │
│   ●  ━━━━━━━━━━━━━━━━━━━━━━     │ ← Agent 圆点 + 引导线
│       coffee chat 从认识对的人开始 │   16px 中文衬线
│                                 │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │      微信一键登录          │  │ ← 黑底白字主按钮
│   └─────────────────────────┘  │
│                                 │
│   ┌─────────────────────────┐  │
│   │       用 Google 登录       │  │ ← outline 按钮（小程序只显示备用）
│   └─────────────────────────┘  │
│                                 │
│   已有账号？     登录            │
│                                 │
└─────────────────────────────────┘
```

**屏 2 · 添加身份**

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│   让你的 Agent 先读懂你           │ ← 中文衬线 24px
│                                 │
│   30 秒内基于你的公开发文构建一个    │ ← 14px 无衬线灰文
│   v0 档案，你可以改任何字段        │
│                                 │
│                                 │
│   ┌───────────────────────────┐ │
│   │ 粘贴你的 LinkedIn /        │ │ ← 输入框
│   │ 小红书 / 个人主页 URL       │ │
│   └───────────────────────────┘ │
│                                 │
│                                 │
│   [手绘插画：手机 + 三个平台图标]    │
│                                 │
│                                 │
│   ┌─────────────────────────┐  │
│   │      让 Agent 读           │  │ ← 主按钮，仅 URL 有效后激活
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**屏 3 · Agent 抓取中**

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                                 │
│       Agent 正在读你...          │ ← 中文衬线 24px
│                                 │
│                                 │
│         [插画：圆点 + 扫描线]       │ ← 手绘，呼吸动画
│                                 │
│                                 │
│   ●  正在分析 12 篇内容...        │ ← 中文衬线 16px，逐条更新
│   ●  正在提炼你的关键标签...       │
│   ●  构建中...                   │
│                                 │
│                                 │
│   ─────────────────────────     │ ← 进度条
│                                 │
└─────────────────────────────────┘
```

**屏 4 · 档案预览**

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│   这是 Agent 看到的你             │ ← Hero 28 中文衬线
│                                 │
│   ┌───────────────────────────┐ │
│   │ [头像]  章璟菲              │ │ ← 卡片 18px 圆角
│   │                            │ │
│   │ AI 产品经理实习生 / HKU      │ │ ← 中文衬线 20px
│   │                            │ │
│   │ #ai-pm  #early-stage       │ │ ← chip outline
│   │ #design-systems            │ │
│   │                            │ │
│   │ 港大 CS 在读 Year 2，已有    │ │ ← 16px 无衬线
│   │ 两段顶尖 AI 公司 PM 实习 ... │ │
│   │                            │ │
│   │            [✎ 改一改]       │ │ ← 每个字段右上角小铅笔
│   └───────────────────────────┘ │
│                                 │
│   ┌─────────────────────────┐  │
│   │      ✓ 看起来对           │  │ ← 黑底白字主按钮
│   └─────────────────────────┘  │
│                                 │
│       让 Agent 重新读             │ ← 文字链接
│                                 │
└─────────────────────────────────┘
```

**屏 5 · objectives 选择**

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│   你想用 Pair 找什么样的人？        │ ← Hero 28 中文衬线
│                                 │
│   选 1–3 项 · 之后随时可改         │ ← 14 灰文
│                                 │
│   ┌───────────────────────────┐ │
│   │ ○ 想聊创业                  │ │ ← chip 状卡，可多选
│   │   和正在做 / 想做的人对谈     │ │   16 + 12 二级
│   └───────────────────────────┘ │
│                                 │
│   ┌───────────────────────────┐ │
│   │ ● 想找 mentor               │ │ ← 选中态：黑底白字
│   │   找比你深 3-5 年的同行       │ │
│   └───────────────────────────┘ │
│                                 │
│   ┌───────────────────────────┐ │
│   │ ○ 跨界打听                  │ │
│   │   想了解某行业是怎么运作的    │ │
│   └───────────────────────────┘ │
│                                 │
│   ┌───────────────────────────┐ │
│   │ ○ 找联创                    │ │
│   └───────────────────────────┘ │
│                                 │
│   ┌─────────────────────────┐  │
│   │      完成注册              │  │
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

### 4.2 Today 主屏

```
┌─────────────────────────────────┐
│ [微信原生顶 bar / 自定义]          │
├─────────────────────────────────┤
│                                 │
│   下午好，jingfei                 │ ← Hero 28 中文衬线（圆周旅迹同款）
│   ─────────────────────────     │ ← 1px 微分隔
│   ●  Agent · 扫了 247 人 ·       │ ← Agent status，16px 中文衬线
│      3 位待你审 · 下一轮 14:00    │
│                                 │
│   今日匹配                       │ ← 区块标题 20 中文衬线
│                                 │
│   ┌───────────────────────────┐ │
│   │ Sarah Chen                 │ │
│   │ Senior PM @ Stripe         │ │
│   │ ─────────────────          │ │
│   │ #ai-pm  #early-stage       │ │ ← outline chip
│   │ ─────────────────          │ │
│   │ Why ta:                    │ │ ← serif 16
│   │ Both exploring early AI    │ │
│   │ startups. She just left... │ │
│   │ ─────────────────          │ │
│   │ Agent drafted:             │ │
│   │ "Hi Sarah, your transition │ │ ← accent-soft 微底
│   │ from infra to product..."  │ │
│   │ ─────────────────          │ │
│   │ [发出] [改写] [Pass ▾]      │ │ ← 主+次+ghost
│   └───────────────────────────┘ │
│                                 │
│   ┌───────────────────────────┐ │
│   │ Daniel Liu · ...           │ │
│   └───────────────────────────┘ │
│                                 │
│   想找特定的人？  ⌘K              │ ← 文字链 + FAB 入口
│                                 │
│                          ┌───┐  │
│                          │ + │  │ ← 黑色圆形 FAB
│                          └───┘  │
│                                 │
└─────────────────────────────────┘
```

---

### 4.3 A2A Dialogue 实时预览（Pair 灵魂屏）

**关键判断**：用户选择"实时预览双方 Agent 在谈什么"——这是 Pair 区别于 chatbot 的核心视觉冲击。

```
┌─────────────────────────────────┐
│  ←  双方 Agent 正在对齐             │
│     预计 1–2 分钟 · [截停]         │
├─────────────────────────────────┤
│                                 │
│   两个 Agent · 5 轮对齐 · 第 2 轮  │ ← Hero 20 中文衬线
│                                 │
│   ─────────────────              │
│                                 │
│   ●  我的 Agent                  │ ← Agent 圆点（accent 色）
│   ━━━━━━━━━━━━━━━━━━━━━━        │   ← 左对齐 + 中文衬线
│   "我是 jingfei 的 Agent。       │
│   她是 HKU 在读的 AI PM，         │
│   两段实习..."                   │
│                                 │
│   ─────────────────              │
│                                 │
│              Sarah 的 Agent  ●   │ ← 右对齐 + 中文衬线
│              ━━━━━━━━━━━━━━━━━━ │
│              "我是 Sarah 的       │
│              Agent。她最近从       │
│              Stripe infra 转..."  │
│                                 │
│   ─────────────────              │
│                                 │
│   ●  Agent thinking...           │ ← 当前正在生成的下一轮
│   ●●●                            │   3 个呼吸点
│                                 │
│   ─────────────────              │
│                                 │
│   预计还要 45 秒 ━━━━━━━━━━       │ ← 进度条
│                                 │
│   ┌─────────────────────────┐  │
│   │       截停对话             │  │ ← outline 按钮
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**关键交互**：
- 每轮 Agent 发言出现时：fade + 8px slide，240ms
- 双方对话左右对齐区分
- 用户可随时按"截停" → 状态转 aborted
- 完成后自动跳转 Summary Card

---

### 4.4 A2A Summary Card（Pair 标志性 UI）

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│   [手绘插画：双 Agent 连接]         │
│                                 │
│   对齐完成                       │ ← Hero 28 中文衬线
│                                 │
│   ─────────────────              │
│                                 │
│   对齐度  8 / 10                │ ← 大数字 36 Fraunces
│   "都在 early-stage AI，目标     │ ← serif 16
│   重叠度高"                      │
│                                 │
│   ─────────────────              │
│                                 │
│   你眼中的 Sarah                │ ← 区块标题 20 中文衬线
│                                 │
│   ┌───────────────────────────┐ │
│   │ 刚从 Stripe infra 转 PM，   │ │ ← bg-sunken 微底
│   │ 正在 explore 创业方向。      │ │   serif 16
│   │ 对 multi-agent 系统有       │ │
│   │ first-hand 经验...           │ │
│   └───────────────────────────┘ │
│                                 │
│   Sarah 眼中的你                │
│                                 │
│   ┌───────────────────────────┐ │
│   │ HKU 在读，已有两段顶尖 AI    │ │
│   │ 公司 PM 实习。对 Agent 架构  │ │
│   │ 有 first-principle 判断...   │ │
│   └───────────────────────────┘ │
│                                 │
│   可以聊的话题                    │
│                                 │
│   ● AI PM 求职策略 / 海外路径    │ ← 16 serif，每条独立 bullet
│   ● Stripe → 创业的心路历程       │
│   ● multi-agent 架构的 trade-off │
│                                 │
│   ─────────────────              │
│                                 │
│   ⚠ 风险提示                    │ ← 仅有时才显示
│   Sarah 近期较忙，建议两周后约     │
│                                 │
│   ─────────────────              │
│                                 │
│   ┌─────────────────────────┐  │
│   │      安排见面              │  │ ← 黑底白字主按钮
│   └─────────────────────────┘  │
│                                 │
│   ┌─────────────────────────┐  │
│   │      我先看看             │  │ ← outline
│   └─────────────────────────┘  │
│                                 │
│   不感兴趣 · 看完整对话           │ ← 文字链
│                                 │
└─────────────────────────────────┘
```

---

### 4.5 Pair 公开档案（独立 H5）

URL：`pair.app/u/jingfei`

```
┌─────────────────────────────────────────┐
│  Pair                       登录 / 加入   │ ← 顶部极简 nav
├─────────────────────────────────────────┤
│                                         │
│                                         │
│   [手绘名片边框包裹下方]                    │
│                                         │
│   章璟菲                                 │ ← 巨型 Hero 36 中文衬线
│   AI PM at Moonshot Kimi · HKU CS Y2    │ ← 20 中文衬线
│                                         │
│   #ai-pm  #moonshot  #early-stage       │ ← outline chip 横排
│                                         │
│   ──────────────────────                │
│                                         │
│   港大 CS 在读 Year 2。两段顶尖 AI 公司    │ ← serif 18
│   PM 实习——Moonshot Kimi Agent 方向、    │
│   万兴科技 AIGC 视频。运营 1.3w 粉小红书 │
│   账号，专注 AI 产品体验对比。             │
│                                         │
│   ──────────────────────                │
│                                         │
│   我想用 Pair 聊                          │ ← 区块 20 中文衬线
│                                         │
│   ● 想聊创业                              │ ← serif 16
│   ● 想找 mentor（AI / 出海方向）           │
│                                         │
│   ──────────────────────                │
│                                         │
│   ┌───────────────────────────────────┐ │
│   │      让 Agent 帮我们破冰              │ │ ← 主 CTA
│   │     （需要先安装 Pair 小程序）         │ │ ← 12 灰文
│   └───────────────────────────────────┘ │
│                                         │
│   [二维码：扫码加入 Pair]                  │
│                                         │
└─────────────────────────────────────────┘
```

**关键**：
- 整页极简，全部走衬线 hero
- 唯一 CTA 引导扫码进 Pair 小程序
- 不暴露用户邮箱 / 电话 / 实时位置
- 分享时自动生成 OG image（同样的卡片样式）

---

### 4.6 其他必要屏（快速 spec）

| 屏 | 关键元素 | 备注 |
|---|---|---|
| **Drawer · 人详情** | 头像 + 名字 + supertag + Why now + 建议话题 + 历史互动 + CTA | 微信小程序里走从底部滑入的"半屏抽屉" |
| **My Connections（People 页）** | 顶部 chip 切换"已建立 / 潜在" + 卡片列表 | 复用 Match Card 视觉 |
| **Settings** | 头像 + objectives 卡片 + 偏好 + 屏蔽 + 帐号 | 极简，每项一行 |
| **会后反馈卡** | 见到了吗（yes/no）+ 打分 1–5 + 一句话标签 | bg-raised + 大圆角 |
| **空状态** | 手绘插画 + Agent 一段话 + 一个 CTA | 不放图片 placeholder |
| **错误态** | "Couldn't load X · Retry" + 简短说明 | 不显示 traceback |

---

## 五、关键组件 Spec

### 5.1 Hero 标题

- 中文：思源宋体 600 / 28px / line-height 1.25 / `--fg-primary`
- 英文/数字：Fraunces 500 / 32px

### 5.2 卡片（Card）

- bg: `--bg-raised` 或 `--bg-card-glass`（半透明用于 sunken bg 上）
- border: 1px solid `--border-subtle`
- radius: 18
- padding: 20
- 间距: 12
- 内部分割线：1px `--border-subtle`

### 5.3 Chip / Supertag

- bg: 透明 / `--bg-sunken`（二态）
- border: 1px solid `--border-strong`（outline 形态）
- radius: 14（pill）
- padding: 4 12
- text: 12 mono 字符 # + sans 文字

### 5.4 按钮

| 类型 | bg | text | border | 用途 |
|---|---|---|---|---|
| **Primary（黑底）** | `--fg-primary` | `--fg-inverse` | none | "发出 invite""安排见面" |
| **Secondary（outline）** | transparent | `--fg-primary` | 1px `--border-default` | "改写""我先看看" |
| **Ghost（文字）** | transparent | `--fg-secondary` | none | "Pass""不感兴趣" |

- radius: 12
- height: 44（小程序触屏标准）
- font: 14 sans 500
- 同一卡上 ≤ 1 个 primary

### 5.5 FAB

- 56x56 圆形
- bg: `--fg-primary`（近黑）
- text: `--fg-inverse`（+ 符号或 ⌘K icon）
- shadow: `--shadow-fab`
- 位置：右下角 distance 16 / 24（安全区）
- 用途：触发"主动 outreach"或命令面板

### 5.6 Composer（小程序内底部）

- 高度 64（含安全区）
- bg: `--bg-raised`
- 上 border-top: 1px `--border-subtle`
- 左侧：Agent 圆点
- 中间：输入框 placeholder "和 Agent 说话…"
- 右侧：发送按钮

**注**：Composer 在 Pair 里是 **次要入口**——主交互是按按钮。Composer 给 power user 用 `/find` `/pair` 等命令。

### 5.7 Agent 视觉（几何符号）

- 14×14px 圆
- 填充：linear-gradient(135deg, `--accent` 0%, `--accent-dark` 100%)
- thinking 状态：外发光 4px `--accent-glow`，1.4s 呼吸
- 永不出现：拟人头像、机器人 emoji、虚拟人 avatar、Memoji 风格

### 5.8 Supertag 库（V1）

- 角色：`#cofounder` `#mentor` `#mentee` `#peer` `#investor` `#advisor`
- 行业：`#ai-pm` `#design` `#engineering` `#growth` `#bd`
- 阶段：`#student` `#early-career` `#manager` `#director` `#founder`
- 状态：`#open-to-chat` `#hiring` `#fundraising` `#exploring`

---

## 六、文案系统

### 6.1 Agent 说话风格

**铁律**：
- 衬线字体承载
- 第一人称 "我"（不是 "Pair"）
- 不用 emoji
- 不用感叹号（最多一个）
- 不卖萌、不撒娇
- 简短：单条 ≤ 80 字

**示例**：
- ✅ "我看了 Sarah 最近的发文，她正在 explore early-stage AI 方向，和你的 objective 重叠度很高。"
- ❌ "嘿嘿~ 我给你找到一个超棒的小姐姐！她和你超合拍哦 🎉"

### 6.2 状态文案

| 状态 | 文案 |
|---|---|
| 注册完成 | "好的。我已经在为你扫描合适的人。第一批匹配预计 24 小时内。" |
| 0 匹配 | "今天还没扫到值得推的人。下一轮 14:00。也可以告诉我你想见谁——按 + 主动找。" |
| Match 待审 | "你有 3 位待审。" |
| A2A 进行中 | "两个 Agent 正在替你们对齐。预计 1–2 分钟。" |
| A2A 完成 | "对齐完成。看一下吧。" |
| 等对方接受 | "已发出。Sarah 的 Agent 会先看你的开场白。" |

### 6.3 反原则

- 禁 "亲"、"宝贝"、"小哥哥/小姐姐"
- 禁 "嘿~"、"哇哦"、"敲棒"
- 禁 emoji 装饰（功能性 emoji 仅在 supertag 不用）
- 禁感叹号连发

---

## 七、反原则（永远不做的事）

| 不做 | 理由 |
|---|---|
| 渐变紫 / 电光蓝 / Notion AI 星星 | 立刻显得"廉价 AI demo" |
| Liquid Glass / 厚 blur 炫技 | 与"工具的尊严"相反 |
| 拟人 Agent 头像 / 机器人 emoji | 这是和 Tara / Replika 的根本切割 |
| 3D / 等距 / Memoji 插画 | toC 娱乐感 |
| 大量 emoji | 职业感掉光 |
| Hover scale 动效 | 让卡片像广告 banner |
| Spinner | 用呼吸 dots，传达"思考"而非"加载" |
| 蓝色 focus ring | 用 accent 木质琥珀 ring |
| Tailwind 默认色板 | 走 token，禁硬编码 |
| 全屏 hero video / illustration | 入口要干净 |
| 9–10 px 字体 | 小程序里看不清 |
| Toast > 1.5s | 1.5s 自动消失 |
| Dark mode（Phase 1） | 先把一个主题做透 |
| 自动播放音频 / video | 小程序合规 + 用户体验 |
| 弹窗式 onboarding tutorial | Agent 自己说话就是 onboarding |

---

## 八、实施清单（按 Demo 冲刺计划对齐）

### Sprint 1（6/30–7/6）· 必出

- [ ] tokens.ts / tokens.wxss（color / space / radius / duration）
- [ ] 字体载入：Fraunces inline subset + 中文衬线 fallback 链
- [ ] 8 张手绘插画 SVG（至少草稿）
- [ ] Figma 3 屏 hi-fi：Today / Match Card / A2A Summary
- [ ] Onboarding 1–2 屏 wireframe

### Sprint 2（7/7–7/13）· 必出

- [ ] Card / Button / Chip / FAB 4 个基础组件实装
- [ ] Today 主屏组件搭骨架
- [ ] Match Card 完整实装

### Sprint 3（7/14–7/20）· 必出

- [ ] A2A Dialogue 实时预览 UI（最关键）
- [ ] Agent 视觉组件 + thinking 动画
- [ ] Onboarding 5 屏全部实装

### Sprint 4（7/21–7/27）· 必出

- [ ] A2A Summary Card 完整实装
- [ ] Drawer · 人详情
- [ ] 公开档案 H5 页

### Sprint 5（7/28–8/4）· 仅修缮

- [ ] 视觉一致性 audit
- [ ] 真机适配测试（iOS 微信 + 安卓微信）
- [ ] 录制 demo 视频

---

## 九、待办与开放问题

1. **Nosh 视觉**：你发截图后我再回填它的特征到本文档（v0.2）
2. **手绘插画风格定调**：是否参考某位插画师？建议参考 Olia Gozha / 圆周旅迹 当前插画师
3. **中文衬线字体确认**：思源宋体免费可商用，鸿蒙宋体需许可——确认用哪个
4. **是否需要"Pair 周报"形态**：每周末 Agent 总结你这周认识了谁
5. **A2A 实时预览的"轮询频率"**：1s 一次 vs 2s 一次（影响 LLM 调用成本）

---

## 文档版本

- v0.1（6/30）：本文，初版基线。基于圆周旅迹截图 + 微信小程序约束 + Pair 设计原则 v0.1
- v0.2 计划：Nosh 截图到位后回填
- v0.3 计划：Figma 3 屏 hi-fi 定稿后回填实际像素 spec
- v1.0 计划：Phase 1 上线后根据真实使用反馈固化
