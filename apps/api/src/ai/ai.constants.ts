/**
 * A2A constants for the API runtime.
 *
 * Mirrors `@pair/shared` constants; duplicated locally to avoid mixing the
 * shared package's ESM/NodeNext build into the NestJS CommonJS runtime.
 * Keep these values in sync with packages/shared/src/constants.ts.
 */
export const A2A_ROUNDS_PER_SIDE = 5;
export const A2A_TOTAL_MESSAGES = 10;
export const A2A_MESSAGE_MAX_CHARS = 200;
