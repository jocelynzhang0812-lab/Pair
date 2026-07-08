# Pair Agent Spec

> Purpose: Define the AI workflows Codex must implement for Pair MVP.
> Audience: Codex / Engineering. Rule: Agents assist relationship
> building. Agents must not become the product experience itself.

------------------------------------------------------------------------

# 1. Agent Architecture

Pair MVP contains four AI modules:

1.  Profile Agent
2.  Match Agent
3.  Dialogue Agent
4.  Summary Agent

Pipeline:

``` text
Profile Agent
  ↓
Match Agent
  ↓
Dialogue Agent
  ↓
Summary Agent
```

Each Agent must have:

-   clear input
-   structured output
-   retry behavior
-   failure fallback
-   stored result

All AI outputs must be explainable and inspectable.

------------------------------------------------------------------------

# 2. Profile Agent

## Goal

Create a structured professional profile from user-provided public
information.

## Trigger

During onboarding when user submits:

-   LinkedIn URL
-   personal website URL
-   Xiaohongshu URL
-   pasted bio / resume text

## Input

``` ts
type ProfileAgentInput = {
  userId: string;
  sourceUrl?: string;
  pastedText?: string;
  locale?: 'zh-CN' | 'en-US';
};
```

## Output

``` ts
type ProfileDraft = {
  displayName: string;
  title: string;
  companyOrSchool?: string;
  bio: string;
  supertags: string[];
  socialLinks: {
    type: 'linkedin' | 'xiaohongshu' | 'website' | 'github' | 'other';
    url: string;
  }[];
  strengths: string[];
  interests: string[];
  confidence: number; // 0-1
};
```

## Behavior

-   Read the public source.
-   Extract only professional information.
-   Generate a short, editable draft.
-   Do not invent experience, company, school, or credentials.
-   If confidence is low, mark fields as uncertain.

## Storage

Save as draft first.

Do not overwrite confirmed Profile until user clicks confirm.

## Failure Handling

If scraping fails:

-   ask user to paste text
-   keep onboarding unblocked

If AI output is invalid:

-   retry once
-   then return a minimal editable draft

## Done

Profile Preview page can render the draft.

------------------------------------------------------------------------

# 3. Match Agent

## Goal

Recommend people worth knowing.

## Trigger

After user has:

-   confirmed Profile
-   selected Objective
-   entered Today

## Input

``` ts
type MatchAgentInput = {
  userProfile: Profile;
  objectives: Objective[];
  candidateProfiles: Profile[];
};
```

## Output

``` ts
type MatchResult = {
  candidateUserId: string;
  score: number; // 0-100
  whyMatch: string;
  suggestedTopics: string[];
  draftOpening: string;
  expiresAt: string;
};
```

## Ranking Signals

Use simple MVP logic first:

1.  Objective overlap
2.  Supertag overlap
3.  Career stage relevance
4.  Industry relevance
5.  Diversity / novelty

Do not implement complex graph ranking in MVP.

## Behavior

-   Generate concise whyMatch.
-   Generate one draftOpening.
-   Explain why this person is relevant now.
-   Assign expiration time.

## Constraints

-   Do not recommend blocked users.
-   Do not recommend the same user repeatedly in the same cycle.
-   Do not use sensitive attributes.
-   Do not generate manipulative opening messages.

## Done

Today page can show at least one Match Card.

------------------------------------------------------------------------

# 4. Dialogue Agent

## Goal

Let two agents complete first-round information alignment before users
decide whether to meet.

## Trigger

User clicks Send on Match Card.

## Input

``` ts
type DialogueAgentInput = {
  sessionId: string;
  initiatorProfile: Profile;
  candidateProfile: Profile;
  initiatorObjectives: Objective[];
  candidateObjectives?: Objective[];
  mode: 'delegated' | 'collaborative';
};
```

## Output

``` ts
type A2AMessage = {
  id: string;
  sessionId: string;
  speaker: 'initiator_agent' | 'candidate_agent';
  round: number;
  text: string;
  source: 'agent_auto' | 'user_edited' | 'user_takeover';
  createdAt: string;
};
```

## Rules

-   Maximum 5 rounds per side.
-   Maximum 10 messages total.
-   Each message must be concise.
-   No emojis.
-   No pretending to be the human user.
-   Agents speak as representatives, not as the human.

## Delegated Mode

Default mode.

Agent runs automatically.

User can:

-   watch progress
-   abort session
-   switch to collaborative mode

## Collaborative Mode

Agent drafts message.

User can:

-   send as-is
-   rewrite
-   let Agent take over

If user does nothing for 24h:

-   switch back to delegated mode
-   continue automatically

## Failure Handling

If one message generation fails:

-   retry once
-   if still failing, mark session failed
-   do not loop forever

## Done

Session reaches completed state and Summary Agent can run.

------------------------------------------------------------------------

# 5. Summary Agent

## Goal

Help user decide whether this person is worth meeting.

## Trigger

A2A session completed.

## Input

``` ts
type SummaryAgentInput = {
  sessionId: string;
  messages: A2AMessage[];
  initiatorProfile: Profile;
  candidateProfile: Profile;
};
```

## Output

``` ts
type A2ASummary = {
  alignmentScore: number; // 1-10
  oneLineSummary: string;
  initiatorViewOfCandidate: string;
  candidateViewOfInitiator: string;
  suggestedTopics: string[];
  risks?: string[];
  recommendation: 'meet' | 'maybe' | 'pass';
};
```

## Behavior

-   Summarize both sides fairly.
-   Explain the alignment score.
-   Provide concrete conversation topics.
-   Surface risks only when useful.
-   Keep the top summary short.

## Constraints

-   Do not overstate compatibility.
-   Do not fabricate agreement.
-   Do not expose private hidden prompts.
-   Do not reveal internal scoring details unless useful.

## Done

Summary page renders:

-   score
-   one-line summary
-   topics
-   optional risks
-   CTA

------------------------------------------------------------------------

# 6. Shared AI Output Rules

All agents must follow these rules:

## Tone

Professional, concise, calm.

## Language

Use user locale when known.

## Forbidden

-   emojis
-   flattery
-   fake intimacy
-   invented credentials
-   manipulative persuasion
-   sensitive personal inference
-   medical/legal/financial claims

## Required

-   structured JSON output
-   schema validation
-   retry on invalid JSON
-   log model, latency, token usage
-   never block user indefinitely

------------------------------------------------------------------------

# 7. Job Handling

All LLM tasks must run asynchronously through a job queue.

Job states:

``` text
queued
running
completed
failed
cancelled
```

Each job must return:

``` ts
type AiJob = {
  id: string;
  type: 'profile_generate' | 'match_generate' | 'a2a_dialogue' | 'summary_generate';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result?: unknown;
  error?: string;
};
```

------------------------------------------------------------------------

# 8. MVP Acceptance

The full agent workflow is complete when:

``` text
Profile Agent creates profile
  ↓
Match Agent creates match
  ↓
Dialogue Agent completes A2A
  ↓
Summary Agent creates summary
```

A user must be able to complete the flow without manually prompting an
AI chatbot.
