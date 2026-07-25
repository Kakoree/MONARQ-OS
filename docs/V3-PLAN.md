# MONARQ OS — V3 Plan

Planning only — no code written against this document yet. Grounded in a
direct audit of the live codebase and database (not the V2 backlog doc's
claims taken at face value); see "What was verified" at the end for the
specific checks run.

---

## Part 1 — Gap Analysis

For every deferred item and surfaced gap from `docs/V3-BACKLOG.md`: what's
actually blocking it, and how much risk it is to leave as-is at MONARQ's
current scale (12 profiles, 6 active members, pre-launch).

### Explicitly deferred items

| Item | What's blocking it | Risk of leaving as-is |
|---|---|---|
| **Revenue analytics** | Missing decision (which processor) + missing integration. Not "unbuilt," genuinely can't start without your call. | Low today (no money moves through the app at all). Grows as drops/mentor sessions scale — admin has no real financial visibility, which limits business decisions, not user-facing risk. |
| **Mentor payments/payouts** | Same processor decision, plus compliance work (tax forms, international payout rules if mentors aren't all in one country). | Low today. Medium-term product risk — mentors won't keep donating time indefinitely without pay; this is the actual ceiling on the mentor marketplace's growth. |
| **Full DM/chat platform** | Missing infra (zero Realtime usage anywhere in this codebase, confirmed by grep) + missing decisions (retention, moderation-at-message-scale). Genuinely large, not a quick add. | Low. Circle (1:1 connections) is the belonging primitive right now and hasn't been stress-tested by real usage yet — over-building chat before that's validated would be premature. |
| **AI coach** | Missing decision (model/provider, cost, what data it can see, safety boundaries) + large unbuilt scope. | None currently — purely additive, nothing depends on it. |
| **In-app live rooms/calls** | Missing third-party integration (WebRTC/video SDK — Vercel has no native video primitive) + infra decision. | Low — the existing event + external join-link pattern (reused for mentor sessions) is a working substitute. |
| **Local chapters** | Missing decision (what a "chapter" scopes — geography? admin-defined regions?) + real schema work (a tenancy dimension doesn't exist anywhere in the current schema). | None currently — nobody's asked for it, nothing blocks on it existing. But see Part 4 — this one has real architectural teeth if it ever gets built. |

### Surfaced gaps (mostly unbuilt, not decision-blocked)

| Item | What's blocking it | Risk of leaving as-is |
|---|---|---|
| **Multi-member pods** | Nothing but build time — the Phase 6 connections table/RLS pattern is a proven primitive to extend. | Low-medium. "Belonging needs more than a feed" is a stated brand pillar; a pair is a good MVP but smaller than the brand's own promise long-term. |
| **Teachings admin CRUD** | Nothing — same shape as the Challenges/Drops admin pages already built. | **Highest risk of any surfaced gap.** Every content change today is a raw SQL statement run by hand against production — no validation, no audit-log entry (bypasses `logAdminAction` entirely), no undo. This is an operational safety gap, not a missing feature. |
| **Tier admin editing** | Nothing — small, well-understood scope. | Low-medium. A wrong `min_points` today can only be corrected by creating a replacement tier and orphaning the old one (no delete UI, though the RLS would technically allow it via direct dashboard SQL). Low risk at 6 members; blocks safely iterating on Phase 4/9 tier config. |
| **True proactive nudges (cron)** | Real infra: Vercel Cron + an API route + a service-role Supabase client to scan across all members (something no code in this repo does today). | Low right now (6 active members are mostly already opening the app). Grows in importance with the member base — this is precisely the "recovery, not guilt" retention story from V2's brand pillars, and it currently only reaches people who are *already* in the app, which is the population that needs it least. |
| **Mentor availability (real scheduling)** | Decision: build a custom slot-picker vs. integrate Cal.com/Calendly, plus moderate build time either way. | Low today — mentor volume is presumably ~0 pre-launch. Becomes real once mentors are active. |

### Housekeeping

| Item | Risk |
|---|---|
| **`lib/supabase/types.ts` hand-authored** | Low-medium, compounding. I've manually kept this in sync across all 40 migrations. Nothing stops future drift — no CI check, no generation step. Cheaper to close now than after more schema grows on top of it. |
| **Zero automated test suite** | Medium-high, and growing. Every phase of V2 was verified by `tsc`/`eslint`/`next build`/Supabase advisors — real but shallow: none of that catches a wrong RLS policy or a business-logic bug (e.g., is the grace-token stockpile cap actually enforced under a race?). Blast radius is small at 6 members; won't stay small. |
| **No live logged-in walkthrough, ever** | **Highest-risk item in this entire document.** Six phases of security-sensitive functionality — RLS policies, security-definer functions spanning two different user roles (member vs. mentor), multi-step forms — have never been exercised by an actual authenticated session. Everything was verified by reading code and running builds, never by clicking through as a real user. |

---

## Part 2 — Recommendation: verify before building

**Yes to both a live walkthrough and a baseline test suite, and I'd sequence
both before any new V3 feature phase — not in parallel with one, before it.**

Why this isn't optional, given what's actually at stake:

- Every V2 phase added at least one RLS policy or security-definer function
  gating who can see or do what across two different actors (member ↔
  mentor, requester ↔ recipient, reporter ↔ reported). None of it has been
  adversarially tested. A wrong policy here doesn't crash a build — it
  silently leaks or blocks the wrong data, exactly the class of bug
  `tsc`/`eslint`/`next build` cannot catch.
- Six active members is the cheapest this problem will ever be to find and
  fix. It will not get cheaper by waiting, and V3's own highest-stakes phase
  (payments, if you choose to pursue it) makes the cost of an undiscovered
  RLS mistake categorically worse — financial data instead of habit data.
- This is exactly the kind of foundational work that's easy to keep
  deferring in favor of visible feature work, which is precisely why I'm
  recommending it get sequenced first rather than fit in "eventually."

**What I'd scope it as** (not a QA department, a targeted pass):

1. **One live walkthrough**, done together — not something I can do alone.
   I don't have test credentials in any session, and I'm not going to
   fabricate having tested something I didn't. This needs either your own
   login, or a throwaway test account you create for me to drive. Covers
   the full cross-domain path Phase 10 named but never actually walked:
   onboarding → habit check-in → grace-token recovery → season tier →
   connect with another member → request/confirm/complete a mentor session
   → claim a key drop → admin approves the mentor, configures the drop's
   tier gate, sees the retention dashboard reflect all of it.
2. **A small, targeted automated suite** (Vitest) — not exhaustive coverage,
   aimed specifically at the RLS policies and security-definer functions
   built in V2: can user A read/write user B's connection, mentorship
   request, or report; does `grant_grace_token` actually refuse a 4th token;
   does `confirm_mentorship_request` reject a non-mentor caller. Run against
   a real Supabase branch (this project already has branching available),
   not mocks — consistent with how this codebase has been built throughout.

---

## Part 3 — The V3 Roadmap

### Phase 0 — Verification Foundation
**What it adds:** The live walkthrough and test suite from Part 2, a
regenerated `lib/supabase/types.ts` via `supabase gen types typescript
--linked` (closes the hand-authored-drift risk), and fixes for whatever
either pass turns up.
**Why it's first:** Every other phase either adds new RLS surface (pods) or
raises the stakes of getting RLS wrong (payments). This pays down the
verification debt before either happens.
**Needs from you:** A test account or your own login for the walkthrough
session. Everything else is self-contained.

### Phase 1 — Admin Completeness & Safety
**What it adds:** Teachings/tracks admin CRUD (create/edit teachings,
categories, mentor-track assignment) and tier edit/reorder/delete — the two
surfaced gaps that are pure unbuilt scope with no decision blocking them,
same shape as the Challenges and Drops admin pages already shipped in V2.
**Why here:** Directly closes the highest operational-risk item short of
Phase 0 (raw SQL against production) and a real safety gap in tier config,
before drops/season configuration gets any more elaborate.
**Needs from you:** Nothing — fully scoped and buildable as-is.

### Phase 2 — Real Proactive Nudges (Scheduled Jobs)
**What it adds:** The first scheduled-job infrastructure in this codebase —
a Vercel Cron job + API route + service-role Supabase client scanning
at-risk members daily, replacing the current app-open-only nudge. Built as
general-purpose infra, not a one-off: later phases (season-end reminders,
mentor no-show follow-ups, drop early-access-opened alerts) reuse the same
job runner.
**Why here:** Pure infrastructure, no third-party decision required (Vercel
Cron is available on your existing plan), and it unblocks every later phase
that wants scheduled behavior.
**Needs from you:** One small check — confirm your Vercel plan tier. Hobby
caps cron at 2 jobs, daily-minimum interval; if you want more granular
scheduling later this may need a Pro upgrade. Not a hard blocker, just flag
it before I build against assumptions about frequency.

### Phase 3 — Multi-Member Pods
**What it adds:** Extends Phase 6 (V2)'s connection primitive into real
pods — 3+ members, a shared space, pod-level accountability — the actual
"small pods" scope the V2 plan named and Phase 6 deliberately scoped down
from.
**Why here:** Sequenced after Phase 0 specifically because this is more
surface area on exactly the kind of multi-actor, RLS-sensitive pattern
Phase 0 exists to have proven solid first.
**Needs from you:** Nothing — no third-party dependency, pure schema/RLS/UI
extension of an existing pattern.

### Phase 4 — Mentor Scheduling Depth
**What it adds:** Real time-slot availability for mentors, replacing the
binary "accepting requests" toggle.
**Why here:** Mentor volume should exist by now (post-launch) to justify
it; premature before then.
**Needs from you — a decision before this phase starts:** build a custom
slot-picker in-house (more control, more build time, no new dependency), or
integrate Cal.com/Calendly (less build time, real recurring-availability
handling, but a third-party account and API key you'd need to provision).
I can execute either — I want your call on which, since it's a genuine
build-vs-buy tradeoff, not something I should default silently.

### Phase 5 — Payments Foundation
**What it adds:** A real payment processor wired in — bringing drop
checkout in-app (replacing the external-link pattern) and mentor session
payment, plus payout scheduling.
**Why here:** This is what actually unblocks Revenue Analytics (Phase 6)
and Mentor Payouts — both are flatly impossible without it.
**Needs from you — hard blocker, not a preference:** which processor
(Stripe is the obvious default given how commonly it pairs with
Vercel/Next.js, but that's your call to make, not mine) and how much of the
integration surface you want built vs. using the processor's own hosted
checkout/Connect flows. I will not start writing code for this phase
without that decision — it's real money movement and compliance exposure,
the one category of decision in this entire plan I'd treat as a hard stop
regardless of how the standing authorization is scoped.

### Phase 6 — Revenue & Financial Analytics
**What it adds:** Admin dashboard extension — drop revenue, mentor payout
totals, per-drop/per-mentor performance — using Phase 5's real transaction
data.
**Why here:** Structurally impossible before Phase 5 exists; would be fake
numbers otherwise, which the brand doctrine explicitly rules out.
**Needs from you:** Nothing beyond Phase 5 already having happened —
fully buildable by me once real data exists.

### Phase 7 — Belonging Depth: Lightweight Messaging
**What it adds:** A scoped step up from Circle — threaded replies within a
pod (Phase 3), possibly simple DMs between connected members. Explicitly
*not* the full chat platform, which stays deferred.
**Why here:** This is the first place in the whole V3 plan where I'd
actually reach for Supabase Realtime — the first persistent-connection
pattern this codebase would ever use. Sequenced late so pods (Phase 3) have
had time to be used and validated first.
**Needs from you:** Nothing to start scoping, but worth knowing going in:
Supabase Realtime connections count against your project's plan limits —
worth a plan-tier check at this point, same as the Phase 2 Vercel note.

### Phase 8 — AI Coach Foundation *(decision-gated, not scoped yet)*
**What it adds:** Nothing yet — this phase is a placeholder for a scoping
conversation, not a build plan. I'm not pre-scoping model/provider/data
boundaries without you in that conversation directly; it's the most
speculative deferred item and deserves its own dedicated discussion, not a
line item under a general V3 greenlight.
**Needs from you:** A dedicated conversation before this becomes a real
phase with real scope.

### Explicitly left out of V3 entirely
**Live rooms/calls and local chapters** are not sequenced anywhere above.
Nothing else in V3 depends on either existing, and both carry large,
genuinely separate scope (live rooms = a video-infrastructure vendor
decision; chapters = a tenancy/geography schema decision — see Part 4).
Recommend both stay deferred to V4+ rather than force a slot into V3 for
the sake of not leaving them out. Named here explicitly so they're carried
forward, not silently dropped — same principle the V2 backlog doc itself
used.

---

## Part 4 — Architectural concerns for scaling toward the deferred items

These aren't blocking anything in V3 as scoped above, but they're real
facts about the current codebase worth knowing before chat, live rooms, or
chapters ever get built on top of it.

1. **Zero real-time infrastructure exists anywhere.** Confirmed by grep —
   no `supabase.channel()`, no `postgres_changes` subscription, nothing.
   Every feature in this app, including the ones that feel like they should
   be live (notifications, connection requests, mentorship status) is
   fetched fresh on each server-rendered page load. This is a *correct*
   choice for what's been built so far — it's simpler and cheaper. It will
   not hold up for chat or live rooms, which need push, not pull. That
   means chat/live-rooms work is a new architectural layer sitting
   alongside the current one, not an incremental extension of it.

2. **No background job or worker infrastructure at all.** `app/api/` is
   empty. No cron, no queue. Every mutation in this codebase happens
   synchronously inside a server action triggered directly by a user's own
   request — nothing has ever needed to process something it didn't
   directly cause. Phase 5 (payments) will be the first time this matters:
   Stripe webhooks need an API route with idempotency handling, and there's
   no precedent for that pattern anywhere in 40 migrations and ~9 phases of
   code. Phase 2 (cron) starts building this muscle earlier and cheaper, on
   a lower-stakes feature, deliberately.

3. **`lib/supabase/types.ts` has been hand-maintained through the entire
   build.** It works today because I've been careful, but nothing enforces
   it staying correct — no generation step, no CI check for drift. Closing
   this in Phase 0, before the schema grows further and before Phase 5
   raises the cost of a type mistake, is deliberate sequencing, not
   busywork.

4. **The security model has reasoning behind it, not adversarial testing.**
   Every RLS policy and security-definer function across V2 was carefully
   reasoned through by me and reviewed against the existing patterns in the
   codebase — but "carefully reasoned" and "tested against a real second
   account" are different confidence levels. Chat, live rooms, and payments
   all raise the cost of an RLS mistake substantially (a wrong policy leaks
   private messages or financial data, not just a habit streak) — this
   needs to be closed in Phase 0, not discovered during Phase 5 or 7.

5. **Single-tenant schema — no chapter/org dimension exists anywhere.**
   Every table assumes one global MONARQ instance. If local chapters ever
   get built, it is not a small additive feature — it likely means
   retrofitting a scoping dimension (`chapter_id` or similar) across a
   dozen-plus tables and their RLS policies, or standing up chapter-scoped
   views everywhere those tables are read. Worth knowing now, before any
   future schema decision accidentally assumes global-only in a way that's
   expensive to unwind later.

6. **Migrations are applied directly, not tracked through Supabase's own
   migration system.** `supabase migration list` / the CLI's own tracking
   returns empty despite all 40 files existing and being live — this
   project has never been CLI-linked. Not urgent, but compounding: the
   longer this goes untracked, the harder a future `supabase db pull` /
   proper linkage will be to reconcile against 40+ hand-applied migrations.

7. **One thing that isn't a concern — worth saying plainly.** The
   security-definer-function pattern used everywhere in V2 (grace tokens,
   connections, mentorship requests, drop claims) is a genuinely sound
   foundation: it correctly keeps sensitive state transitions
   server-controlled instead of trusting client-supplied values, and it
   extends cleanly to payments (a `capture_payment`-style function) and
   pods (an `add_pod_member` function) without needing an architecture
   change. This part of the codebase scales fine as-is.

---

## What was verified for this document (not assumed)

- All 40 files in `supabase/migrations/` cross-checked against live
  `information_schema.tables` (30 tables) and `information_schema.routines`
  (17 functions) — exact match, no drift.
- `app/admin/seasons/actions.ts` read directly — confirmed no tier
  update/delete/reorder action exists.
- `app/admin/**/page.tsx` enumerated — confirmed no teachings admin page.
- Confirmed no `app/api/`, `vercel.json`, or `vercel.ts` exist — zero
  scheduled-job infra, not even a partial stub.
- `package.json` scripts and `grep` for `*.test.ts`/`*.spec.ts` outside
  `node_modules` — confirmed no test framework installed, no project test
  files exist.
- Supabase dashboard checked live (not from memory): Google OAuth
  **Disabled**, Confirm Email **Off** — both match your stated intent.
- `grep` for `realtime`/`channel`/`postgres_changes` across `lib/` and
  `components/` — zero matches, confirmed no Realtime usage anywhere.
- Live row counts: 12 profiles, 6 active memberships.
