/**
 * Generates `styles/tokens.css` from the typed token source of truth.
 *
 * Run via `pnpm --filter @pair/shared tokens:css` (which builds first, then
 * runs this against the compiled `dist/css.js`). Never edit tokens.css by hand.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderCssVariables } from '../dist/css.js';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'styles');
const outFile = join(outDir, 'tokens.css');

mkdirSync(outDir, { recursive: true });

const header =
  '/* Pair · Design Tokens — GENERATED from src/tokens.ts. Do not edit by hand. */\n' +
  '/* Regenerate: pnpm --filter @pair/shared tokens:css */\n\n';

writeFileSync(outFile, header + renderCssVariables(), 'utf8');
console.log(`wrote ${outFile}`);
