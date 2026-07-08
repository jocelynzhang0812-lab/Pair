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
export declare const colors: {
    readonly bgBase: "#F7F5F0";
    readonly bgRaised: "#FFFFFF";
    readonly bgSunken: "#EFECE5";
    readonly bgCardGlass: "rgba(255, 255, 255, 0.6)";
    readonly bgOverlay: "rgba(20, 18, 16, 0.4)";
    readonly fgPrimary: "#141210";
    readonly fgSecondary: "#6B655E";
    readonly fgTertiary: "#A39E96";
    readonly fgInverse: "#F7F5F0";
    readonly borderSubtle: "#EAE6DD";
    readonly borderDefault: "#D5CFC2";
    readonly borderStrong: "#141210";
    readonly accent: "#B68559";
    readonly accentDark: "#7F5C3B";
    readonly accentSoft: "#F2E9DC";
    readonly accentGlow: "rgba(182, 133, 89, 0.18)";
    readonly success: "#5B7F4D";
    readonly warning: "#B5933E";
    readonly danger: "#A94D49";
};
/** 渐变 · 仅用于 Agent 几何符号（14px 圆点）。 */
export declare const gradients: {
    readonly agent: "linear-gradient(135deg, #B68559 0%, #7F5C3B 100%)";
};
/** 字体栈 · Agent 说话用中文衬线，用户说话用无衬线。 */
export declare const fontFamily: {
    readonly serif: "\"Source Han Serif SC\", \"Noto Serif CJK SC\", \"FZShuSong-Z01S\", \"STSongti-SC\", serif";
    readonly serifEn: "\"Fraunces\", \"Source Serif Pro\", Georgia, serif";
    readonly sans: "\"Inter\", -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif";
    readonly mono: "\"JetBrains Mono\", \"SF Mono\", Consolas, monospace";
};
/** 字号档（只用这 6 档）。 */
export declare const fontSize: {
    readonly xs: "12px";
    readonly sm: "14px";
    readonly base: "16px";
    readonly md: "20px";
    readonly lg: "28px";
    readonly xl: "36px";
};
/** 行高 · 与字号档一一对应。 */
export declare const lineHeight: {
    readonly xs: "1.5";
    readonly sm: "1.5";
    readonly base: "1.55";
    readonly md: "1.4";
    readonly lg: "1.25";
    readonly xl: "1.15";
};
/** 字重。 */
export declare const fontWeight: {
    readonly regular: "400";
    readonly medium: "500";
    readonly semibold: "600";
    readonly bold: "700";
};
/** 间距档 · 基础单位 4px。 */
export declare const space: {
    readonly 1: "4px";
    readonly 2: "8px";
    readonly 3: "12px";
    readonly 4: "16px";
    readonly 5: "20px";
    readonly 6: "24px";
    readonly 8: "32px";
    readonly 12: "48px";
    readonly 16: "64px";
};
/** 圆角 · 按圆周旅迹改大。 */
export declare const radius: {
    readonly chip: "14px";
    readonly control: "12px";
    readonly card: "18px";
    readonly modal: "20px";
    readonly full: "9999px";
};
/** 阴影 · 几乎不用 box-shadow，立体靠 border + 微 elevation。 */
export declare const shadow: {
    readonly card: "0 1px 0 rgba(20, 18, 16, 0.04)";
    readonly elevated: "0 6px 20px rgba(20, 18, 16, 0.06), 0 1px 0 rgba(20, 18, 16, 0.04)";
    readonly fab: "0 4px 12px rgba(20, 18, 16, 0.18)";
    readonly modal: "0 -8px 32px rgba(20, 18, 16, 0.10)";
    readonly drawer: "-4px 0 24px rgba(20, 18, 16, 0.08)";
    readonly ringFocus: "0 0 0 2px #B68559";
};
/** 动效时长。 */
export declare const duration: {
    readonly fast: "120ms";
    readonly base: "240ms";
    readonly slow: "360ms";
};
/** 动效曲线。 */
export declare const easing: {
    readonly out: "cubic-bezier(0.16, 1, 0.3, 1)";
    readonly inOut: "cubic-bezier(0.4, 0, 0.2, 1)";
};
/** 布局 · 关键尺寸常量。 */
export declare const layout: {
    readonly threadMaxWidth: "720px";
    readonly drawerWidth: "380px";
    readonly headerHeight: "52px";
    readonly composerHeight: "64px";
    readonly composerHeightMin: "56px";
    readonly composerHeightMax: "120px";
    readonly cardPadding: "20px";
    readonly cardPaddingCompact: "16px";
    readonly cardGap: "12px";
    readonly screenMarginMobile: "16px";
    readonly screenMarginDesktop: "24px";
    readonly agentDotSize: "14px";
};
/** 全部 token 的聚合对象，便于整体引用。 */
export declare const tokens: {
    readonly colors: {
        readonly bgBase: "#F7F5F0";
        readonly bgRaised: "#FFFFFF";
        readonly bgSunken: "#EFECE5";
        readonly bgCardGlass: "rgba(255, 255, 255, 0.6)";
        readonly bgOverlay: "rgba(20, 18, 16, 0.4)";
        readonly fgPrimary: "#141210";
        readonly fgSecondary: "#6B655E";
        readonly fgTertiary: "#A39E96";
        readonly fgInverse: "#F7F5F0";
        readonly borderSubtle: "#EAE6DD";
        readonly borderDefault: "#D5CFC2";
        readonly borderStrong: "#141210";
        readonly accent: "#B68559";
        readonly accentDark: "#7F5C3B";
        readonly accentSoft: "#F2E9DC";
        readonly accentGlow: "rgba(182, 133, 89, 0.18)";
        readonly success: "#5B7F4D";
        readonly warning: "#B5933E";
        readonly danger: "#A94D49";
    };
    readonly gradients: {
        readonly agent: "linear-gradient(135deg, #B68559 0%, #7F5C3B 100%)";
    };
    readonly fontFamily: {
        readonly serif: "\"Source Han Serif SC\", \"Noto Serif CJK SC\", \"FZShuSong-Z01S\", \"STSongti-SC\", serif";
        readonly serifEn: "\"Fraunces\", \"Source Serif Pro\", Georgia, serif";
        readonly sans: "\"Inter\", -apple-system, \"PingFang SC\", \"Microsoft YaHei\", sans-serif";
        readonly mono: "\"JetBrains Mono\", \"SF Mono\", Consolas, monospace";
    };
    readonly fontSize: {
        readonly xs: "12px";
        readonly sm: "14px";
        readonly base: "16px";
        readonly md: "20px";
        readonly lg: "28px";
        readonly xl: "36px";
    };
    readonly lineHeight: {
        readonly xs: "1.5";
        readonly sm: "1.5";
        readonly base: "1.55";
        readonly md: "1.4";
        readonly lg: "1.25";
        readonly xl: "1.15";
    };
    readonly fontWeight: {
        readonly regular: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
    };
    readonly space: {
        readonly 1: "4px";
        readonly 2: "8px";
        readonly 3: "12px";
        readonly 4: "16px";
        readonly 5: "20px";
        readonly 6: "24px";
        readonly 8: "32px";
        readonly 12: "48px";
        readonly 16: "64px";
    };
    readonly radius: {
        readonly chip: "14px";
        readonly control: "12px";
        readonly card: "18px";
        readonly modal: "20px";
        readonly full: "9999px";
    };
    readonly shadow: {
        readonly card: "0 1px 0 rgba(20, 18, 16, 0.04)";
        readonly elevated: "0 6px 20px rgba(20, 18, 16, 0.06), 0 1px 0 rgba(20, 18, 16, 0.04)";
        readonly fab: "0 4px 12px rgba(20, 18, 16, 0.18)";
        readonly modal: "0 -8px 32px rgba(20, 18, 16, 0.10)";
        readonly drawer: "-4px 0 24px rgba(20, 18, 16, 0.08)";
        readonly ringFocus: "0 0 0 2px #B68559";
    };
    readonly duration: {
        readonly fast: "120ms";
        readonly base: "240ms";
        readonly slow: "360ms";
    };
    readonly easing: {
        readonly out: "cubic-bezier(0.16, 1, 0.3, 1)";
        readonly inOut: "cubic-bezier(0.4, 0, 0.2, 1)";
    };
    readonly layout: {
        readonly threadMaxWidth: "720px";
        readonly drawerWidth: "380px";
        readonly headerHeight: "52px";
        readonly composerHeight: "64px";
        readonly composerHeightMin: "56px";
        readonly composerHeightMax: "120px";
        readonly cardPadding: "20px";
        readonly cardPaddingCompact: "16px";
        readonly cardGap: "12px";
        readonly screenMarginMobile: "16px";
        readonly screenMarginDesktop: "24px";
        readonly agentDotSize: "14px";
    };
};
export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colors;
export type FontSizeToken = keyof typeof fontSize;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
//# sourceMappingURL=tokens.d.ts.map