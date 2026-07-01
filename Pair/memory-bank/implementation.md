# Pair Implementation Plan for Codex

> Purpose: Step-by-step execution plan for Codex. Rule: Do not start
> step N+1 until step N is fully completed and verified. Scope: Pair MVP
> only.

------------------------------------------------------------------------

# 0. Global Execution Rules

1.  Execute steps in order.
2.  Do not skip steps.
3.  Do not create future features unless explicitly listed.
4.  After each step, run the verification checklist.
5.  If verification fails, stop and fix the current step.
6.  Do not continue with known broken state.
7.  Do not introduce unapproved libraries.
8.  Do not hardcode design values.
9.  Do not implement social feed, general chat, meeting scheduling, or
    feedback in MVP.
10. Keep all code small, typed, and testable.

------------------------------------------------------------------------

# 1. Repository Foundation

## Step 1.1 Create project structure

Goal: Create the monorepo structure.

Actions: - Create `apps/miniprogram` - Create `apps/web` - Create
`apps/api` - Create `packages/shared` - Create `memory-bank` - Create
`docs` - Create `.github/workflows`

Verification: - All folders exist. - No source code added yet.

Stop condition: Do not continue if the folder structure is missing.

------------------------------------------------------------------------

## Step 1.2 Add root metadata

Goal: Make repository recognizable as a workspace.

Actions: - Add root `package.json` - Add workspace configuration - Add
root `README.md` - Add `.gitignore` - Add `.editorconfig`

Verification: - Package manager detects workspaces. - `README.md`
explains project layout. - `.gitignore` excludes node_modules, env
files, build output.

Stop condition: Do not continue if workspace is not recognized.

------------------------------------------------------------------------

## Step 1.3 Add TypeScript base config

Goal: All packages share TypeScript settings.

Actions: - Add root `tsconfig.base.json` - Configure strict mode -
Configure path aliases for shared package

Verification: - Empty TypeScript project type-checks. - No implicit any
allowed.

Stop condition: Do not continue if TypeScript config fails.

------------------------------------------------------------------------

## Step 1.4 Add formatting and linting

Goal: Establish code quality baseline.

Actions: - Add Prettier config - Add ESLint config - Add lint scripts -
Add format scripts

Verification: - `lint` runs without crashing. - `format` runs without
crashing.

Stop condition: Do not continue if lint tools fail.

------------------------------------------------------------------------

# 2. Shared Package

## Step 2.1 Initialize shared package

Goal: Create shared package used by all apps.

Actions: - Create `packages/shared/package.json` - Create
`src/index.ts` - Export placeholder modules

Verification: - Other apps can import from shared package. - Shared
package builds.

Stop condition: Do not continue if shared imports fail.

------------------------------------------------------------------------

## Step 2.2 Add design tokens

Goal: Create single source of truth for UI tokens.

Actions: - Add `src/tokens.ts` - Define colors - Define typography -
Define spacing - Define radius - Define shadows - Define durations

Required tokens: - bgBase - bgRaised - bgSunken - fgPrimary -
fgSecondary - fgTertiary - fgInverse - accent - accentDark -
accentSoft - accentGlow

Verification: - Tokens are exported. - No UI app hardcodes token values.

Stop condition: Do not continue if tokens are incomplete.

------------------------------------------------------------------------

## Step 2.3 Add domain types

Goal: Create shared business types.

Actions: - Add `src/types.ts` - Define User - Define Profile - Define
Objective - Define Match - Define A2ASession - Define A2AMessage -
Define A2ASummary - Define PublicProfile - Define AiJob

Verification: - Types compile. - No `any` types used.

Stop condition: Do not continue if types fail compile.

------------------------------------------------------------------------

## Step 2.4 Add constants

Goal: Keep enums and constants centralized.

Actions: - Add `src/constants.ts` - Add objective options - Add supertag
options - Add A2A max rounds - Add polling interval

Verification: - Constants are exported. - A2A max rounds equals 5 per
side. - Polling interval equals 2000ms.

Stop condition: Do not continue if constants are inconsistent.

------------------------------------------------------------------------

# 3. API Foundation

## Step 3.1 Initialize NestJS API

Goal: Create runnable backend app.

Actions: - Initialize NestJS in `apps/api` - Enable TypeScript strict
mode - Remove demo controller/service - Add health endpoint

Verification: - API starts locally. - Health endpoint returns ok.

Stop condition: Do not continue if API cannot start.

------------------------------------------------------------------------

## Step 3.2 Add config module

Goal: Centralize environment variables.

Actions: - Add config module - Add `.env.example` - Define required env
vars: - DATABASE_URL - REDIS_URL - JWT_SECRET - OPENAI_API_KEY -
WECHAT_APP_ID - WECHAT_APP_SECRET

Verification: - API fails clearly if required env var missing. -
`.env.example` contains all required keys.

Stop condition: Do not continue if config is unclear.

------------------------------------------------------------------------

## Step 3.3 Add Prisma

Goal: Connect API to database.

Actions: - Install Prisma - Create Prisma schema - Configure PostgreSQL
datasource - Add Prisma service

Verification: - Prisma generates client. - API can connect to database.

Stop condition: Do not continue if database connection fails.

------------------------------------------------------------------------

## Step 3.4 Create initial schema

Goal: Add minimum data model.

Actions: - Add User model - Add Profile model - Add Objective model -
Add SocialLink model - Create migration

Verification: - Migration runs successfully. - Prisma Studio shows
tables.

Stop condition: Do not continue if migration fails.

------------------------------------------------------------------------

## Step 3.5 Extend schema for MVP

Goal: Add remaining MVP models.

Actions: - Add Match model - Add A2ASession model - Add A2AMessage
model - Add A2ASummary model - Add PublicProfile model - Add AiJob
model - Add enums for statuses

Verification: - Migration runs successfully. - Relations are visible in
Prisma Studio. - No orphaned required relations.

Stop condition: Do not continue if relations are invalid.

------------------------------------------------------------------------

## Step 3.6 Add logging and error format

Goal: Make API errors predictable.

Actions: - Add request logging - Add global exception filter - Use
response shape: - code - message - details

Verification: - 404 returns consistent error. - Validation error returns
consistent error. - No stack trace exposed.

Stop condition: Do not continue if errors are inconsistent.

------------------------------------------------------------------------

# 4. Auth

## Step 4.1 Add auth module

Goal: Prepare authentication structure.

Actions: - Create AuthModule - Create UsersModule - Add JWT service -
Add current user decorator

Verification: - Protected test route works. - Unauthorized request
returns 401.

Stop condition: Do not continue if JWT guard fails.

------------------------------------------------------------------------

## Step 4.2 Implement mock login

Goal: Unblock local development.

Actions: - Add `POST /auth/mock-login` - Create or return test user -
Return access token

Verification: - Mock login returns valid JWT. - Token accesses protected
route.

Stop condition: Do not continue if local auth fails.

------------------------------------------------------------------------

# 5. Apps Prototype

## Step 5.1 Initialize web app

Goal: Make `apps/web` a runnable Next.js app prototype that matches
`demo.png` and validates the core Pair experience before API integration.

Actions:
- Add `apps/web/package.json`.
- Add Next.js App Router files.
- Use TypeScript + CSS Modules / global CSS variables.
- Import shared tokens, constants, and types from `@pair/shared`.
- Keep data behind a mock API adapter so real API integration can replace it.

Verification:
- `pnpm --filter @pair/web typecheck` passes.
- `pnpm --filter @pair/web dev` starts locally.
- Browser flow works: Login -> Onboarding -> Today -> A2A -> Summary.

Stop condition: Do not initialize miniprogram until the web prototype is
runnable and visually aligned enough for review.

------------------------------------------------------------------------

## Step 5.2 Build app design primitives

Goal: Create reusable UI primitives that map to the demo prototype.

Actions:
- Add Button, AgentDot, Chip, ProgressBar, PhoneShell, BottomNav, MatchCard,
  Drawer, and Toast equivalents as needed.
- Use `@pair/shared` tokens and generated CSS variables.
- Avoid Tailwind and avoid hardcoded ad hoc colors.

Verification:
- Components render across mobile and desktop browser widths.
- Text does not overflow compact controls.
- Primary button uses near-black, not accent.

------------------------------------------------------------------------

## Step 5.3 Build core flow screens

Goal: Implement the first usable product loop.

Actions:
- Login.
- Onboarding: add identity, Agent reading, profile preview, objectives,
  A2A mode preference.
- Today with Match Card.
- Match detail drawer.
- A2A Preview with simulated incremental messages.
- Summary Card.
- Public Profile preview section.

Verification:
- User can complete the full mocked flow without a backend.
- A2A progress updates over time and reaches Summary.
- Page is visually close to `demo.png` in layout, tone, and component
  hierarchy.

------------------------------------------------------------------------

## Step 5.4 Initialize miniprogram app

Goal: Create the微信小程序 shell after the web prototype is reviewed.

Actions:
- Add native miniprogram app config, pages, components, and shared mock data.
- Recreate the approved web flow using WXML / WXSS / TypeScript.

Verification:
- 微信开发者工具 can open the project.
- Login -> Onboarding -> Today -> A2A -> Summary is navigable with mock data.

------------------------------------------------------------------------

## Step 4.3 Implement WeChat login

Goal: Support Mini Program login.

Actions: - Add `POST /auth/wechat-login` - Accept code - Exchange for
openid - Upsert user - Return JWT

Verification: - Works with test code or mocked WeChat adapter. - Invalid
code returns clear error.

Stop condition: Do not continue if login flow is unstable.

------------------------------------------------------------------------

# 5. Profile Flow API

## Step 5.1 Add ProfilesModule

Goal: Read and write user profile.

Actions: - Add `GET /profiles/me` - Add `POST /profiles/me` - Validate
input

Verification: - User can create profile. - User can read same profile. -
Other users cannot access private profile.

Stop condition: Do not continue if profile CRUD fails.

------------------------------------------------------------------------

## Step 5.2 Add ObjectivesModule

Goal: Save user objectives.

Actions: - Add `GET /objectives` - Add `POST /users/me/objectives` -
Enforce 1 to 3 selected objectives

Verification: - User can save 1 objective. - User can save 3
objectives. - Saving 4 objectives returns 400.

Stop condition: Do not continue if objective constraints fail.

------------------------------------------------------------------------

# 6. AI Job Foundation

## Step 6.1 Add JobsModule

Goal: Track async AI jobs.

Actions: - Add job model access - Add `GET /jobs/:id` - Add job status
states: - queued - running - completed - failed - cancelled

Verification: - Created job can be fetched. - Unknown job returns 404.

Stop condition: Do not continue if job tracking fails.

------------------------------------------------------------------------

## Step 6.2 Add AI service wrapper

Goal: Centralize LLM calls.

Actions: - Create AiModule - Create AiService - Add model config - Add
structured output helper - Add retry once on invalid JSON

Verification: - Mock call returns structured JSON. - Invalid output is
handled.

Stop condition: Do not continue if AI service lacks schema validation.

------------------------------------------------------------------------

## Step 6.3 Add Profile Agent

Goal: Generate profile draft.

Actions: - Add `POST /profiles/me/generate` - Accept URL or pasted
text - Create AI job - Return jobId - Store draft result in job

Verification: - Request returns jobId. - Job eventually returns profile
draft. - Empty input returns 400.

Stop condition: Do not continue if profile draft cannot be produced.

------------------------------------------------------------------------

## Step 6.4 Confirm profile draft

Goal: User saves generated profile.

Actions: - Add confirm action or reuse `POST /profiles/me` - Persist
selected draft fields - Mark onboarding profile complete

Verification: - Confirmed profile appears in `GET /profiles/me`.

Stop condition: Do not continue if draft cannot become profile.

------------------------------------------------------------------------

# 7. Matching

## Step 7.1 Add seed users

Goal: Enable demo matching.

Actions: - Create seed script - Add 5 to 10 candidate profiles - Add
tags and objectives

Verification: - Seed script runs. - Candidate users exist in database.

Stop condition: Do not continue if seed data is missing.

------------------------------------------------------------------------

## Step 7.2 Add MatchesModule

Goal: Expose match API.

Actions: - Add `GET /matches` - Add `POST /matches/:id/pass` - Add
`POST /matches/:id/send`

Verification: - `GET /matches` returns list. - Pass hides match. - Send
creates A2A session placeholder.

Stop condition: Do not continue if send does not create session.

------------------------------------------------------------------------

## Step 7.3 Implement Match Agent

Goal: Generate match fields.

Actions: - Score candidates - Generate whyMatch - Generate
draftOpening - Set expiresAt

Verification: - Match has score. - Match has whyMatch. - Match has
draftOpening. - Match has expiration time.

Stop condition: Do not continue if Today cannot render match card.

------------------------------------------------------------------------

# 8. A2A Backend

## Step 8.1 Create A2A session

Goal: Start agent-to-agent session.

Actions: - Add `POST /a2a` - Accept matchId - Create session - Create AI
job - Return sessionId

Verification: - Session created. - Job created. - Match status changes
to invited.

Stop condition: Do not continue if session creation fails.

------------------------------------------------------------------------

## Step 8.2 Read A2A session

Goal: Allow frontend polling.

Actions: - Add `GET /a2a/:id` - Return: - status - currentRound -
messages - estimatedSeconds - summary if exists

Verification: - Empty session returns valid response. - Unauthorized
user cannot read session.

Stop condition: Do not continue if polling response shape is unstable.

------------------------------------------------------------------------

## Step 8.3 Implement Dialogue Agent

Goal: Generate A2A messages.

Actions: - Generate messages round by round - Max 5 rounds per side -
Store each message - Mark session completed

Verification: - Completed session has max 10 messages. - Messages
alternate between agents. - Session status becomes completed.

Stop condition: Do not continue if session does not complete.

------------------------------------------------------------------------

## Step 8.4 Implement abort

Goal: User can stop session.

Actions: - Add `POST /a2a/:id/abort` - Mark session aborted - Stop
future generation

Verification: - Aborted session stops generating. - Polling shows
aborted.

Stop condition: Do not continue if abort is ignored.

------------------------------------------------------------------------

## Step 8.5 Implement Summary Agent

Goal: Generate summary after A2A completes.

Actions: - Read session messages - Generate alignment score - Generate
one-line summary - Generate topics - Generate optional risks - Store
summary

Verification: - Completed session has summary. - Summary contains score
and topics. - Score is 1 to 10.

Stop condition: Do not continue if summary is missing.

------------------------------------------------------------------------

# 9. Mini Program Foundation

## Step 9.1 Initialize Mini Program

Goal: Create runnable mini program.

Actions: - Create app files - Configure TypeScript - Configure pages -
Add build config

Verification: - Opens in WeChat DevTools. - Shows blank start page.

Stop condition: Do not continue if mini program cannot launch.

------------------------------------------------------------------------

## Step 9.2 Add request client

Goal: Standardize API calls.

Actions: - Create API client - Inject JWT - Handle 401 - Handle errors

Verification: - Mock login works from mini program. - Protected request
works.

Stop condition: Do not continue if API client is unstable.

------------------------------------------------------------------------

## Step 9.3 Add tokens to Mini Program

Goal: Apply design system.

Actions: - Generate or write `tokens.wxss` - Import globally - Add font
classes - Add base page styles

Verification: - Page uses token colors. - No hardcoded color in demo
page.

Stop condition: Do not continue if token styles fail.

------------------------------------------------------------------------

## Step 9.4 Add base components

Goal: Build reusable UI.

Actions: - Create Card - Create Button - Create Chip - Create AgentDot -
Create Progress - Create ErrorState

Verification: - Component showcase page renders all components. -
Components use tokens.

Stop condition: Do not continue if components are not reusable.

------------------------------------------------------------------------

# 10. Mini Program Onboarding

## Step 10.1 Login page

Goal: User can log in.

Actions: - Build login UI - Connect mock login first - Store token

Verification: - Login moves to profile import page.

Stop condition: Do not continue if token is not stored.

------------------------------------------------------------------------

## Step 10.2 Profile import page

Goal: User submits profile source.

Actions: - Build URL/text input - Validate non-empty input - Call
profile generate API - Navigate to loading page with jobId

Verification: - Valid input creates job. - Empty input shows error.

Stop condition: Do not continue if jobId is missing.

------------------------------------------------------------------------

## Step 10.3 Agent reading page

Goal: Show profile generation progress.

Actions: - Poll `GET /jobs/:id` - Show progress - Show reading status
text - Navigate to profile review when complete

Verification: - Completed job opens review page. - Failed job shows
retry.

Stop condition: Do not continue if polling flow breaks.

------------------------------------------------------------------------

## Step 10.4 Profile review page

Goal: User confirms generated profile.

Actions: - Render draft - Allow edit basic fields - Confirm profile -
Navigate to objective page

Verification: - Confirm saves profile. - Reload shows saved profile.

Stop condition: Do not continue if profile is not persisted.

------------------------------------------------------------------------

## Step 10.5 Objective page

Goal: User selects goals.

Actions: - Show objective cards - Allow 1 to 3 selected - Save
objectives - Navigate to Today

Verification: - 0 selected blocks continue. - 4 selected blocks
continue. - Valid selection enters Today.

Stop condition: Do not continue if objective constraints fail.

------------------------------------------------------------------------

# 11. Mini Program Today

## Step 11.1 Today shell

Goal: Render Agent workspace.

Actions: - Add header - Add Agent status - Add empty match area - Add
bottom nav placeholder

Verification: - Today page renders without data.

Stop condition: Do not continue if layout breaks.

------------------------------------------------------------------------

## Step 11.2 Fetch matches

Goal: Show real match data.

Actions: - Call `GET /matches` - Render loading state - Render empty
state - Render ready state

Verification: - Seed data appears. - Empty state works.

Stop condition: Do not continue if data state is wrong.

------------------------------------------------------------------------

## Step 11.3 Match card

Goal: Render match card.

Actions: - Show avatar - Show name - Show role - Show whyMatch - Show
draftOpening - Show Send and Pass

Verification: - Card matches UI spec. - Long text wraps safely.

Stop condition: Do not continue if card cannot fit viewport.

------------------------------------------------------------------------

## Step 11.4 Pass action

Goal: User can dismiss match.

Actions: - Call pass API - Remove card - Show next card or empty state

Verification: - Passed match disappears. - Refresh does not show passed
match.

Stop condition: Do not continue if pass is not persistent.

------------------------------------------------------------------------

## Step 11.5 Send action

Goal: User starts A2A.

Actions: - Call send API - Receive sessionId - Navigate to A2A page

Verification: - Clicking Send opens A2A page.

Stop condition: Do not continue if sessionId is missing.

------------------------------------------------------------------------

# 12. Mini Program A2A

## Step 12.1 A2A page shell

Goal: Render A2A workspace.

Actions: - Add title - Add progress - Add message timeline - Add abort
button

Verification: - Page opens with sessionId.

Stop condition: Do not continue if page cannot read sessionId.

------------------------------------------------------------------------

## Step 12.2 Poll A2A status

Goal: Display live session.

Actions: - Poll every 2s - Render messages - Render current round -
Render estimated time

Verification: - New messages appear without refresh. - Polling stops
when completed.

Stop condition: Do not continue if polling leaks after page leave.

------------------------------------------------------------------------

## Step 12.3 Abort action

Goal: User can stop session.

Actions: - Call abort API - Stop polling - Show aborted state

Verification: - Abort stops updates. - Back to Today works.

Stop condition: Do not continue if abort continues polling.

------------------------------------------------------------------------

## Step 12.4 Navigate to Summary

Goal: Complete A2A flow.

Actions: - When session completed, navigate to Summary - Pass sessionId

Verification: - Completed session opens Summary.

Stop condition: Do not continue if summary navigation fails.

------------------------------------------------------------------------

# 13. Mini Program Summary

## Step 13.1 Summary page shell

Goal: Render summary result.

Actions: - Fetch session - Read summary - Render loading state

Verification: - Page opens from A2A.

Stop condition: Do not continue if session cannot load.

------------------------------------------------------------------------

## Step 13.2 Summary content

Goal: Show decision information.

Actions: - Render alignment score - Render one-line summary - Render
topics - Render risks if any - Render CTA

Verification: - Score appears. - Topics appear. - Missing risks hide
risk section.

Stop condition: Do not continue if summary fields are missing.

------------------------------------------------------------------------

## Step 13.3 Summary actions

Goal: Allow user to continue or return.

Actions: - `I will look first` returns Today - `Arrange meeting` shows
MVP placeholder

Verification: - Return works. - Placeholder does not crash.

Stop condition: Do not continue if user gets stuck.

------------------------------------------------------------------------

# 14. Web Public Profile

## Step 14.1 Initialize web app

Goal: Create Next.js public profile app.

Actions: - Initialize Next.js - Add app router - Add shared tokens - Add
base layout

Verification: - Web app starts. - Home page renders.

Stop condition: Do not continue if web app fails build.

------------------------------------------------------------------------

## Step 14.2 Public profile API

Goal: Backend exposes public profile.

Actions: - Add `GET /public/:slug` - Return public-safe fields only - Do
not expose email or phone

Verification: - Existing slug returns profile. - Missing slug returns
404. - Sensitive fields absent.

Stop condition: Do not continue if sensitive data leaks.

------------------------------------------------------------------------

## Step 14.3 Public profile page

Goal: Render identity card.

Actions: - Add `/u/[slug]` - Fetch public profile - Render name - Render
role - Render tags - Render bio - Render objectives - Render QR
placeholder

Verification: - Public page opens independently. - Mobile layout works.

Stop condition: Do not continue if public page is unreadable on mobile.

------------------------------------------------------------------------

# 15. Integration

## Step 15.1 End-to-end local flow

Goal: Full MVP works locally.

Actions: - Login - Generate profile - Confirm profile - Select
objective - View Today - Send match - Complete A2A - View Summary - Open
Public Profile

Verification: - Entire flow completes without manual database edits.

Stop condition: Do not continue if any step requires manual patching.

------------------------------------------------------------------------

## Step 15.2 Replace mock with real adapters

Goal: Use real integrations where available.

Actions: - Replace mock auth with WeChat auth - Replace mock AI with
OpenAI - Keep feature flags for local mock

Verification: - Real mode works. - Mock mode still works locally.

Stop condition: Do not continue if real integration breaks local dev.

------------------------------------------------------------------------

## Step 15.3 Error states

Goal: Handle common failures.

Actions: - Profile generation failed - No matches - A2A failed - Summary
missing - Public profile missing

Verification: - Each error has UI. - User can recover or go back.

Stop condition: Do not continue if user can get stuck.

------------------------------------------------------------------------

# 16. Testing

## Step 16.1 API tests

Goal: Protect backend flows.

Actions: - Test auth - Test profile - Test objectives - Test matches -
Test A2A - Test public profile

Verification: - Tests pass.

Stop condition: Do not continue if core API tests fail.

------------------------------------------------------------------------

## Step 16.2 UI smoke tests

Goal: Protect frontend navigation.

Actions: - Test login flow - Test onboarding flow - Test Today - Test
A2A - Test Summary

Verification: - Smoke tests pass or manual QA checklist passes.

Stop condition: Do not release if smoke flow fails.

------------------------------------------------------------------------

## Step 16.3 Visual audit

Goal: Ensure design consistency.

Actions: - Check tokens - Check fonts - Check buttons - Check cards -
Check Agent dot - Check no default blue/purple AI style

Verification: - `docs/visual-audit.md` completed.

Stop condition: Do not release if main screens violate design system.

------------------------------------------------------------------------

# 17. Release

## Step 17.1 Environment setup

Goal: Prepare deployment.

Actions: - Configure API environment - Configure database - Configure
Redis - Configure web deployment - Configure mini program project

Verification: - All env vars exist. - No secret committed.

Stop condition: Do not deploy if secrets are missing or leaked.

------------------------------------------------------------------------

## Step 17.2 Deploy API

Goal: Backend online.

Actions: - Deploy API - Run migration - Check health endpoint

Verification: - Health endpoint ok. - Database connected. - Redis
connected.

Stop condition: Do not continue if API health fails.

------------------------------------------------------------------------

## Step 17.3 Deploy Web

Goal: Public profile online.

Actions: - Deploy Next.js app - Configure API base URL - Open sample
public profile

Verification: - Public profile loads.

Stop condition: Do not continue if web page cannot fetch API.

------------------------------------------------------------------------

## Step 17.4 Upload Mini Program

Goal: MVP available as experience version.

Actions: - Build mini program - Upload experience version - Test on real
device

Verification: - Login works. - Core flow works on real device.

Stop condition: Do not call MVP complete if real device flow fails.

------------------------------------------------------------------------

# 18. MVP Definition of Done

MVP is done only when all are true:

-   User can log in.
-   User can create profile.
-   User can select objectives.
-   User can view Today matches.
-   User can send a match.
-   A2A completes.
-   Summary is generated.
-   Public profile is accessible.
-   No blocking error in full flow.
-   Design system is respected.
-   No out-of-scope features added.
