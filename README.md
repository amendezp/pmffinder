# PMFinder

A guided journey app that walks you through the **scientific Product/Market Fit process** — sourcing, hypothesis, validation, metrics, surprise, decision — and exports a polished 2-pager investor memo at the end.

*"When a great team meets a great market, something special happens."*

## What it does

- **8 stages**, each with a structured form. Open from the start; passed stages are marked green.
- **AI grades each stage** against an encoded rubric — unique (non-consensus) insight, technological inflection, desperate (not needing) customers, behavioral (not intent) metrics, savor the surprise, pivot the Who not the What.
- **Per-stage evidence panel**: upload screenshots, paste transcripts. Images are passed to the grader so it can verify your claims.
- **Coaching chat per stage**: Socratic helper that uses the same rubric, but doesn't grade — pressure-test your draft before submitting.
- **2-pager investor memo** synthesized from all 8 stages, printable to PDF, shareable via public token link.

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion
- Supabase: Postgres + Auth (magic link) + Storage (private "evidence" bucket)
- Anthropic SDK · fast model for stage grading + coaching chat · larger model for memo synthesis (see `lib/anthropic.ts`)
- Memo export = print-styled HTML route (`@page` + `window.print()`) → PDF via browser

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run `db/schema.sql`, then `db/policies.sql`.
3. In Authentication → Providers, ensure **Email** (magic link) is enabled. You don't need to enable any OAuth providers.
4. In Authentication → URL Configuration, add `http://localhost:3000/auth/callback` to the redirect URL list (and your prod URL when deployed).
5. Storage → confirm the private `evidence` bucket exists (schema.sql creates it).

### 3. Get your env vars

Copy `.env.example` to `.env.local` and fill in:

```bash
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Supabase keys are in Project Settings → API. The service role key is **server-only** and bypasses RLS — never expose it client-side.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in. The magic link will arrive in your email.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the project on Vercel.
3. Add the same env vars from `.env.local` to the Vercel project's Environment Variables.
4. Update `NEXT_PUBLIC_APP_URL` to your deployed URL (e.g. `https://pmfinder.vercel.app`).
5. Add your prod `/auth/callback` to the Supabase redirect URL allowlist.

## Project structure

```
app/
  api/                          # Server route handlers
    grade-stage/                # LLM-graded stage gating
    stage-chat/                 # Streaming Socratic coach
    evidence/upload/            # Multipart upload to Supabase Storage
    memo-share/                 # Toggle public + rotate token
    generate-memo/              # Synthesize 2-pager
  projects/[id]/                # Per-project routes
    page.tsx                    # Compass + journey map
    stage/[n]/page.tsx          # Stage form + evidence + chat
    memo/                       # Printable 2-pager investor memo
  m/[token]/page.tsx            # Public read-only memo
  auth/                         # Magic-link callback + sign-out
  sign-in/                      # Sign-in page

components/                     # Compass, JourneyMap, StageForm, FeedbackPanel,
                                # EvidencePanel, CoachingChat, MemoTemplate, ShareMemoDialog
lib/
  rubrics/                      # 7 stage rubrics — the heart of the app
  memo/                         # 2-pager template + synthesizer
  supabase/                     # Server + browser clients
  anthropic.ts                  # Anthropic SDK + model selection
  grading.ts                    # Stage-grading logic
db/                             # schema.sql + policies.sql
```

## The 8 stages

| # | Stage | What it checks |
|---|---|---|
| 1 | Sourcing & Vetting | Technological inflection (durable), unique non-consensus insight, authenticity |
| 2 | The What | Rooted in the unique insight; exactly one primary benefit; sharp leap of faith |
| 3 | The Who | Specific lead bowling pin; plausibly desperate (reach-across-table); credible adjacencies |
| 4 | The How | Clear business model; charges from day one (unless ad-based); disruptive angle if claimed |
| 5 | Validate Problem / Concept | Cheap concept-validation method; desperation (not need); prior solution attempts |
| 6 | Validate Implementation | Tried to sell (not asked); behavioral signal; 5 Whys to root cause; "no" diagnosed correctly |
| 7 | MVP PMF Metrics | Behavior-based; exponential organic growth (consumer) or sales yield > 1 (enterprise); word of mouth |
| 8 | Savor the Surprise | A real surprise named; inflection in data; double down rather than fix the bad |

## License

Personal project — adapt freely.
