/**
 * Renders the design tokens as CSS custom properties.
 *
 * This is the bridge from the typed source of truth (`./tokens.ts`) to the CSS
 * variables consumed by the Web app (global stylesheet) and the miniprogram
 * (WXSS `page`). `styles/tokens.css` is produced by feeding this function's
 * output through `scripts/build-css.mjs`.
 */
import { colors, duration, easing, fontFamily, fontSize, fontWeight, gradients, layout, lineHeight, radius, shadow, space, } from './tokens.js';
/** `camelCase` / numeric keys → `kebab-case` (e.g. `bgBase` → `bg-base`). */
function kebab(key) {
    return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}
function emit(obj, prefix) {
    return Object.entries(obj).map(([key, value]) => `  --${prefix}${kebab(key)}: ${value};`);
}
/**
 * Build the full CSS custom-property block.
 *
 * @param selector CSS selector that scopes the variables. Defaults to `:root`
 *   for Web; pass `page` when generating WXSS for the miniprogram.
 */
export function renderCssVariables(selector = ':root') {
    const declarations = [
        ...emit(colors, ''),
        ...emit(gradients, 'gradient-'),
        ...emit(fontFamily, 'font-'),
        ...emit(fontSize, 'text-'),
        ...emit(lineHeight, 'leading-'),
        ...emit(fontWeight, 'weight-'),
        ...emit(space, 'space-'),
        ...emit(radius, 'radius-'),
        `  --shadow-card: ${shadow.card};`,
        `  --shadow-elevated: ${shadow.elevated};`,
        `  --shadow-fab: ${shadow.fab};`,
        `  --shadow-modal: ${shadow.modal};`,
        `  --shadow-drawer: ${shadow.drawer};`,
        `  --ring-focus: ${shadow.ringFocus};`,
        ...emit(duration, 'duration-'),
        ...emit(easing, 'ease-'),
        ...emit(layout, ''),
    ];
    return `${selector} {\n${declarations.join('\n')}\n}\n`;
}
//# sourceMappingURL=css.js.map