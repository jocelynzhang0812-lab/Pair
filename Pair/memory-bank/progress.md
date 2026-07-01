# Pair Progress

> Last updated: 2026-07-01

## Current Focus

Build the first runnable app prototype and connect the Phase-1 backend surface.

## Status

| Area | Status | Notes |
|---|---|---|
| `@pair/shared` | Done | Tokens, types, constants exist. |
| `@pair/api` | Phase-1 API surface | NestJS + Prisma schema, mock auth, profile/objective/match/A2A/summary/public-page controllers exist. |
| `apps/web` | Routed prototype | Next.js prototype initialized with mock data, core flow, and route-based navigation. |
| `apps/miniprogram` | Pending | Starts after web prototype review. |

## Latest Decisions

- Use `apps/web` first for high-fidelity interactive review.
- Use mock data and a mock API adapter before real backend controllers.
- Keep the app visually aligned to `demo.png` and `memory-bank/ui-spec.md`.
- Backend Phase 1 uses synchronous mock A2A generation after invitation send; replace with async jobs/Agent workers later.
- Local API verification runs on port 4000 when the web prototype already occupies port 3000.

## Verification Log

- 2026-06-30: `pnpm --filter @pair/web typecheck` passed.
- 2026-06-30: `pnpm typecheck` passed for `@pair/api`, `@pair/shared`, and `@pair/web`.
- 2026-06-30: `pnpm --filter @pair/web dev --hostname 127.0.0.1 --port 3000` started.
- 2026-06-30: `curl -I http://127.0.0.1:3000` returned `200 OK`.
- 2026-06-30: Route checks passed for `/login`, `/today`, `/a2a/session_sarah`, and `/u/jingfei`.
- 2026-06-30: Extracted `demo 2.html` embedded WebP screens to `apps/web/public/demo2/` for visual reference.
- 2026-06-30: Reworked prototype status icons, onboarding illustrations, Agent orbit art, and public profile portrait/border toward demo2's hand-drawn icon style.
- 2026-06-30: Refined Today / A2A / Summary UI toward demo2: featured match card, compact secondary match, countdown glyph, Agent bridge, and Summary completion mark.
- 2026-06-30: Added `/reference/demo2` to browse all extracted demo2 reference screens.
- 2026-06-30: Used built-in image generation to create `apps/web/public/generated/pair-illustration-sheet-v1.png`, a hand-drawn illustration asset sheet for unclear demo2 areas.
- 2026-07-01: Added API health, global validation/CORS/error shape, JWT mock auth, current-user guard/decorator, and demo network creation on mock login.
- 2026-07-01: Added protected profile, objective, me, match, A2A, summary, and public-page endpoints for the Phase-1 product loop.
- 2026-07-01: Added compatibility routes for `POST /profiles/me`, `GET /objectives`, `POST /users/me/objectives`, and `POST /a2a`.
- 2026-07-01: `pnpm typecheck` passed for `@pair/api`, `@pair/shared`, and `@pair/web`.
- 2026-07-01: Added root `docker-compose.yml` for local Postgres/Redis using locally available `postgres:15` and `redis:7` images.
- 2026-07-01: Replaced Prisma seed placeholder with 6 idempotent candidate profiles and added `@pair/api` scripts `db:seed` and `verify:flow`.
- 2026-07-01: `docker compose up -d` started Postgres/Redis; `pnpm --filter @pair/api prisma:migrate` confirmed DB schema is in sync.
- 2026-07-01: `pnpm --filter @pair/api db:seed` completed successfully.
- 2026-07-01: API booted on `PORT=4000`; `PAIR_API_BASE_URL=http://127.0.0.1:4000 pnpm --filter @pair/api verify:flow` passed through health, mock login, matches, send, A2A, summary, and public page.
- 2026-07-01: Final `pnpm typecheck` passed for `@pair/api`, `@pair/shared`, and `@pair/web`.
- 2026-07-01: Added Prisma migration `20260701031102_ai_jobs_profile_drafts` for `ai_jobs` and `profile_drafts`, plus generated Prisma client.
- 2026-07-01: Added `POST /auth/wechat-login`, `GET /jobs/:id`, `POST /profiles/generate`, `GET /profiles/generate/:jobId`, and `POST /profiles/confirm-draft`.
- 2026-07-01: Added deterministic mock `AiService.generateProfileDraft` to preserve the future LLM contract while keeping local verification offline.
- 2026-07-01: Extended `verify:flow` to cover WeChat login, profile generation job lookup, generated draft polling, and draft confirmation.
- 2026-07-01: `PAIR_API_BASE_URL=http://127.0.0.1:4000 pnpm --filter @pair/api verify:flow` passed with the expanded flow; final `pnpm typecheck` passed.
- 2026-07-01: Checked web/API compatibility and added `apps/web/src/lib/api.ts` with token storage, `{ data }` response handling, and adapters for login, onboarding profile generation, objectives, matches, A2A, summary, and public profile.
- 2026-07-01: Wired web Login/Onboarding/Today/A2A/Summary/Public Profile screens to the API with mock fallback for offline prototype review.
- 2026-07-01: Fixed backend summary score compatibility: new summaries store 0-10 scores and `GET /summaries/:summaryId` clamps legacy 0-100 data for UI display.
- 2026-07-01: `PAIR_API_BASE_URL=http://127.0.0.1:4000 pnpm --filter @pair/api verify:flow` passed after score compatibility fix; final `pnpm typecheck` passed.
