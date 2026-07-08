/**
 * Mini Program runtime config.
 *
 * `USE_MOCK` keeps the prototype fully offline for WeChat DevTools review.
 * Flip it to `false` (and point `API_BASE_URL` at a running `@pair/api`
 * instance) to run against the real backend. The api layer in `src/api.ts`
 * branches on this flag so pages share the same flow in both modes.
 */
export const USE_MOCK = false;

/** Local `@pair/api` runs on 4000 while the web prototype occupies 3000. */
export const API_BASE_URL = 'http://127.0.0.1:4000';

/** Storage key for the JWT access token issued by the API. */
export const TOKEN_STORAGE_KEY = 'pair_access_token';

/**
 * Mirror of `@pair/shared` A2A constants. The WeChat native build cannot
 * resolve the workspace package at runtime, so these values are kept aligned
 * with `packages/shared/src/constants.ts` by hand (same pattern as the token
 * mirror in `styles/tokens.wxss`).
 */
export const A2A_ROUNDS_PER_SIDE = 5;
export const A2A_TOTAL_MESSAGES = 10;
export const A2A_POLL_INTERVAL_MS = 2000;
