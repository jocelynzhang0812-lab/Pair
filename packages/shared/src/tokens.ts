/**
 * Pair · Design Tokens — single source of truth.
 *
 * Transcribed from `memory-bank/design-document.md` §2 (视觉系统).
 * Every design value the product uses lives here as a typed constant.
 * The CSS custom properties in `styles/tokens.css` are GENERATED from this file
 * via `renderCssVariables()` (see `./css.ts`); never hand-edit that file.
 *
 * Rules from the design doc:
 * - 所有色值走 token，禁硬编码 hex。
 * - 暖色 accent (`accent*`) 只用于 Agent 相关元素。
 * - 主按钮用 `fgPrimary`（近黑），不用 accent。
 */

/** 色彩 · 中性暖色基底 + Agent 专属 accent + 克制语义色。 */
export const colors = {
  // 基底（中性暖色系）
  bgBase: '#F7F5F0', // 全局背景，"米白纸感"
  bgRaised: '#FFFFFF', // 卡片背景
  bgSunken: '#EFECE5', // 输入框 / 二级容器 / chip 内填
  bgCardGlass: 'rgba(255, 255, 255, 0.6)', // 半透明大卡
  bgOverlay: 'rgba(20, 18, 16, 0.4)', // drawer / modal 遮罩

  // 前景
  fgPrimary: '#141210', // 正文 / 主标题（不用纯黑，近黑）
  fgSecondary: '#6B655E', // 次要文字、metadata
  fgTertiary: '#A39E96', // 占位符、disabled
  fgInverse: '#F7F5F0', // 暗背景上的文字

  // 边框
  borderSubtle: '#EAE6DD', // 默认
  borderDefault: '#D5CFC2', // hover / 强调
  borderStrong: '#141210', // 选中态 / focus

  // Accent（专属于 Agent 的"声音"）
  accent: '#B68559', // Agent 头像 / focus ring / 进度条 / 关键链接
  accentDark: '#7F5C3B', // hover / pressed / A2A Summary 大数字
  accentSoft: '#F2E9DC', // Agent 消息背景填充（subtle）/ 选中态微 tint
  accentGlow: 'rgba(182, 133, 89, 0.18)', // Agent thinking 呼吸光晕

  // 语义色（克制使用，永不饱和）
  success: '#5B7F4D', // 接受、完成
  warning: '#B5933E', // 待处理、稀缺资源提示
  danger: '#A94D49', // 拉黑、删除、错误
} as const;

/** 渐变 · 仅用于 Agent 几何符号（14px 圆点）。 */
export const gradients = {
  agent: 'linear-gradient(135deg, #B68559 0%, #7F5C3B 100%)',
} as const;

/** 字体栈 · Agent 说话用中文衬线，用户说话用无衬线。 */
export const fontFamily = {
  // 中文衬线 — Hero / 卡片标题 / Agent 发言
  serif:
    '"Source Han Serif SC", "Noto Serif CJK SC", "FZShuSong-Z01S", "STSongti-SC", serif',
  // 英文衬线 — 英文 Hero / 数字
  serifEn: '"Fraunces", "Source Serif Pro", Georgia, serif',
  // 无衬线 — 正文 / UI
  sans: '"Inter", -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  // Mono — supertag # 前缀 / 时间 / 命令
  mono: '"JetBrains Mono", "SF Mono", Consolas, monospace',
} as const;

/** 字号档（只用这 6 档）。 */
export const fontSize = {
  xs: '12px', // metadata / 时间
  sm: '14px', // 次要正文 / 按钮
  base: '16px', // 正文 / Agent 发言
  md: '20px', // 卡片标题
  lg: '28px', // 屏标题（Hero "Today" 之类）
  xl: '36px', // Onboarding Hero（少用）
} as const;

/** 行高 · 与字号档一一对应。 */
export const lineHeight = {
  xs: '1.5',
  sm: '1.5',
  base: '1.55',
  md: '1.4',
  lg: '1.25',
  xl: '1.15',
} as const;

/** 字重。 */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** 间距档 · 基础单位 4px。 */
export const space = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
} as const;

/** 圆角 · 按圆周旅迹改大。 */
export const radius = {
  chip: '14px', // Tag / Chip / Supertag（pill 形）
  control: '12px', // 按钮 / 输入框
  card: '18px', // 卡片
  modal: '20px', // Modal / Drawer 顶部（左上 / 右上 only）
  full: '9999px', // Agent 头像 / 几何符号（圆）/ FAB
} as const;

/** 阴影 · 几乎不用 box-shadow，立体靠 border + 微 elevation。 */
export const shadow = {
  card: '0 1px 0 rgba(20, 18, 16, 0.04)',
  elevated: '0 6px 20px rgba(20, 18, 16, 0.06), 0 1px 0 rgba(20, 18, 16, 0.04)',
  fab: '0 4px 12px rgba(20, 18, 16, 0.18)',
  modal: '0 -8px 32px rgba(20, 18, 16, 0.10)',
  drawer: '-4px 0 24px rgba(20, 18, 16, 0.08)',
  ringFocus: `0 0 0 2px ${colors.accent}`, // focus 一律用琥珀 ring，不用浏览器蓝框
} as const;

/** 动效时长。 */
export const duration = {
  fast: '120ms', // hover、active 状态切换
  base: '240ms', // 卡片入场、切换
  slow: '360ms', // Drawer / Modal 进出
} as const;

/** 动效曲线。 */
export const easing = {
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

/** 布局 · 关键尺寸常量。 */
export const layout = {
  threadMaxWidth: '720px', // 主内容区单列居中
  drawerWidth: '380px', // Drawer 固定宽度
  headerHeight: '52px', // 顶部 status bar（含微信原生导航）
  composerHeight: '64px', // 小程序 Composer 高度（含安全区）
  composerHeightMin: '56px',
  composerHeightMax: '120px',
  cardPadding: '20px',
  cardPaddingCompact: '16px',
  cardGap: '12px',
  screenMarginMobile: '16px',
  screenMarginDesktop: '24px',
  agentDotSize: '14px', // Agent 几何符号尺寸
} as const;

/** 全部 token 的聚合对象，便于整体引用。 */
export const tokens = {
  colors,
  gradients,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  space,
  radius,
  shadow,
  duration,
  easing,
  layout,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colors;
export type FontSizeToken = keyof typeof fontSize;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
