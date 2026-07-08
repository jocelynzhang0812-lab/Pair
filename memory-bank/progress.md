# Pair Progress

> Last updated: 2026-07-02

## Current Focus

Shift product UI execution to Mini Program first, then App, with Web last.

## Status

| Area | Status | Notes |
|---|---|---|
| `@pair/shared` | Done | Tokens, types, constants exist. |
| `@pair/api` | Phase-1 API surface | NestJS + Prisma schema, mock auth, profile/objective/match/A2A/summary/public-page controllers exist. |
| `apps/miniprogram` | Main surface, in progress | Navigation, pages, visual system, Step 5.4 states, request/API client, and A2A polling implemented; runs offline in mock mode. |
| App | Planned after Mini Program | Technology route not yet selected; decide after Mini Program main flow review. |
| `apps/web` | Reference / final surface | Next.js prototype exists and remains useful as reference; new product UI work is no longer Web-first. |

## Latest Decisions

- Product-surface order changed to Mini Program first, App second, Web last.
- Preserve the existing `apps/web` prototype as reference instead of continuing Web-first work.
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
- 2026-07-01: Updated `decisions.md` and `memory-bank/implementation.md` to make product UI execution order Mini Program -> App -> Web, with existing Web work kept as reference.
- 2026-07-01: Initialized `@pair/miniprogram` frontend package with native Mini Program config, token WXSS mirror, mock data, and navigable Login / Onboarding / Today / People / Chats / Me / A2A / Summary / Settings pages.
- 2026-07-01: `pnpm typecheck` passed for `@pair/api`, `@pair/miniprogram`, `@pair/shared`, and `@pair/web`.
- 2026-07-01: Refined Mini Program visual direction toward the provided prototype screenshots: larger serif headlines, lighter paper-like cards, hand-drawn import/profile/contact/settings glyphs, screenshot-style onboarding input, and custom bottom navigation.
- 2026-07-01: Final `pnpm typecheck` passed after Mini Program visual polish.
- 2026-07-02: Replaced CSS-drawn Mini Program icons with cropped PNG assets from the provided prototype screenshots for onboarding, bottom nav, contacts, chats, profile, and settings; also normalized shared margins and typography scale.
- 2026-07-02: Final `pnpm typecheck` passed after PNG asset integration.
- 2026-07-02: Replaced the Web root redirect with a Pally-inspired Pair demo landing page at `/`, including the English slogan, A2A hero preview, product screenshots, detailed new use cases, and trust messaging while preserving existing prototype routes.
- 2026-07-02: `tsc -p apps/web/tsconfig.json --noEmit` and `next build` passed for the Web landing update; Next still reports that ESLint is not installed, so build-time linting remains skipped until the repo adds an ESLint dev dependency/script.
- 2026-07-02: Reworked the Web landing page sections into a single connected Agent-thread narrative, with one continuous vertical line linking problem, flow, product preview, use cases, and trust chapters.
- 2026-07-02: Centralized Mini Program page spacing and typography variables in `app.wxss`, then aligned Login / Onboarding / Today / People / Chats / Me / A2A / Summary / Settings page-level margins, list gaps, card padding, and common font sizes to the same scale.
- 2026-07-02: Final `pnpm typecheck` passed after cross-page spacing normalization.
- 2026-07-02: Set the shared Mini Program top page padding `--pair-page-top` to `156rpx` and removed the Login-only top padding override so all screens share the same top margin.
- 2026-07-02: Reworked Today match UI into a stacked swipe deck: next card sits behind the active card with a visible edge, right-swipe advances the deck, and swiped cards collapse into a bottom shelf showing avatar and name only.
- 2026-07-02: Completed Mini Program frontend state coverage for implementation Step 5.4:
  `apps/miniprogram/src/state-fixtures.ts` now exposes review switches for Today,
  Onboarding profile/generation, A2A, Summary, People, Chats, and Me public
  profile publication.
- 2026-07-02: Added shared `state-panel`, `state-visual`, `state-actions`, and
  `status-pill` UI primitives, then wired Today loading/empty/error/failed,
  Onboarding empty input / generation failed / missing profile fields, A2A
  running/failed/aborted, Summary missing / not-interested / schedule placeholder,
  People empty/error/failed, Chats empty/error/failed plus completed/running/failed
  records, and Me/Settings unpublished profile / settings placeholders / logout
  confirmation.
- 2026-07-02: State review path: change the constants in
  `apps/miniprogram/src/state-fixtures.ts` and recompile in WeChat DevTools; list
  copy for Chats lives in `apps/miniprogram/src/mock-data.ts`, while static page
  title/navigation copy lives in `apps/miniprogram/pages/chats/index.wxml`.
- 2026-07-02: `pnpm --filter @pair/miniprogram typecheck` passed after Step 5.4
  implementation.
- 2026-07-02: Final `pnpm typecheck` passed for `@pair/api`,
  `@pair/miniprogram`, `@pair/shared`, and `@pair/web` after frontend state
  coverage.
- 2026-07-02: Attempted WeChat DevTools CLI project open for visual verification,
  but the IDE service port is disabled in DevTools security settings. No CLI
  visual preview was completed; manual DevTools review should use the state
  switches above.
- 2026-07-02: Added a Mini Program request/API client abstraction so mock and
  real backend modes share the same page flow (implementation Step 5.1 / §9.2):
  `apps/miniprogram/src/config.ts` (`USE_MOCK`, `API_BASE_URL`, mirrored A2A
  constants), `src/request.ts` (`wx.request` wrapper with JWT injection, 401 ->
  clear token + go login, `{ data }` unwrap, normalized errors), and
  `src/api.ts` (`login`, `fetchMatches`, `passMatch`, `sendMatch`,
  `getA2ASession`, `abortA2ASession`). Mock mode simulates the A2A session on a
  real clock, revealing one message per polling interval. To run against the
  real API: set `USE_MOCK = false` and `API_BASE_URL` in `src/config.ts`.
- 2026-07-02: Reworked the A2A page (§12.2) to poll `getA2ASession` every
  `A2A_POLL_INTERVAL_MS` (2000ms) via `setInterval`, reveal messages
  incrementally, stop on `completed`/`aborted`/`failed`, and clear the timer in
  `onUnload` so polling never leaks after leaving the page; abort now calls
  `abortA2ASession`. Wired the previously dead "切换到参与型/托付型" mode toggle to
  update `globalData.a2aMode`. Extended `typings/wx.d.ts` with `wx.request`,
  storage sync APIs, and `setInterval`/`clearInterval`.
- 2026-07-02: Added the Today Match detail drawer (Step 5.3): tapping a match
  card header opens a bottom sheet with whyMatch, bio, the drafted opening, and
  topics plus 发出/再想想. `sendInvite` now routes through `api.sendMatch` to get a
  real `sessionId` and passes it to the A2A page; `passMatch` routes through
  `api.passMatch`.
- 2026-07-02: Wired the Onboarding "改一改" button (§10.4) to an inline edit mode
  for name / headline / bio with non-empty validation and 保存, clearing the
  missing-fields state on save.
- 2026-07-02: `pnpm typecheck` passed for `@pair/api`, `@pair/miniprogram`,
  `@pair/shared`, and `@pair/web` after the request client, A2A polling, Match
  drawer, and Onboarding edit changes.
- 2026-07-02: Executed `memory-bank/backend-integration-plan.md` (小程序后端真机联调).
  Step 1 — reworked `apps/miniprogram/src/api.ts` real-mode branches to map the real
  backend shapes to the Mini Program view types: `login` sends the required
  `MockLoginDto` body and reads `accessToken`; `fetchMatches` maps
  `candidate.profile`/`reason`/`invitation.text` → `MatchView`; A2A maps
  `id→sessionId`, `state→status`, `completedRounds→currentRound`,
  `speaker(Profile)→name`, derives `progress`/`estimatedSeconds`, and fetches
  `GET /summaries/:id` on completion; `sendMatch` reuses the 409
  `A2A_ALREADY_STARTED` `details.sessionId`. `request.ts` now surfaces the backend
  error body (`{ code, message, details }`).
- 2026-07-02: Wired the main real-mode flow through the api client (mock path
  unchanged, so offline review still works): Login calls `login()` to store the
  JWT; Today loads via `fetchMatches()` with loading/empty/error states in real
  mode; Summary fetches via `getA2ASession(sessionId).summary` (extended
  `A2ASummaryView` with `yourView`/`theirView`).
- 2026-07-02: Step 2/4 — brought up `@pair/api` on `PORT=4000` (Postgres/Redis
  already healthy, Prisma schema in sync). `PAIR_API_BASE_URL=http://127.0.0.1:4000
  pnpm --filter @pair/api verify:flow` passed (login→profile→matches→send→A2A
  completed→summary, `alignmentScore` 9–10). Direct curl 对拍 confirmed every field
  the mapper reads: `accessToken`, `candidate.profile.{name,headline,avatarUrl,bio,tags}`,
  `invitation.text`, send `{ sessionId }`, A2A `state/completedRounds/totalRounds=10`,
  `messages[].speaker.name`, summary `alignmentScore(0-10)/scoreReason/riskNote`.
- 2026-07-02: Step 3 — `apps/miniprogram/src/config.ts` `API_BASE_URL` points at
  `http://127.0.0.1:4000`; `USE_MOCK` kept `true` as the offline-safe committed
  default. To run real mode: start the API (`PORT=4000 pnpm --filter @pair/api
  start:dev`), set `USE_MOCK=false`, and in WeChat DevTools enable「不校验合法域名」.
- 2026-07-02: Final `pnpm typecheck` passed for all four packages. On-device WeChat
  DevTools visual walkthrough remains manual (DevTools CLI service port disabled).
- 2026-07-02: Completed real-mode consistency goal: wired People and Me pages to
  the real backend while keeping mock branches.
  - People (`apps/miniprogram/pages/people/index.ts`): real mode derives
    "已建立" / "潜在" tabs from `GET /matches` (with session → established,
    without → potential), with loading/empty/error states; each established item
    carries the real `sessionId` and `summaryId`, and `openPerson` routes to
    Summary or A2A accordingly. Mock mode keeps the static prototype list.
  - Me (`apps/miniprogram/pages/me/index.ts`): real mode loads the viewer's
    profile and public-page status from `GET /me`; "发布公开档案" now calls
    `PATCH /public-pages/me { isPublished: true }` and refreshes status from
    `GET /public-pages/me`. Mock mode stays local-only.
  - `src/api.ts` added `fetchPeople`, `getMe`, `getPublicPageMe`,
    `publishPublicPage` plus the needed view mappers.
  - curl verification confirmed `/me` returns `profile.{name,headline,bio,tags}`
    and `/public-pages/me` returns `publicPage.isPublished`.
- 2026-07-02: Final `pnpm typecheck` passed for `@pair/api`, `@pair/miniprogram`,
  `@pair/shared`, and `@pair/web` after the People/Me real-mode wiring.
