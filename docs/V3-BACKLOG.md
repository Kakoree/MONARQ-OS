# MONARQ OS — V3 Backlog

Written at the close of V2 (Phases 1–10), per Phase 10's own scope: deferred
items get carried forward explicitly, not silently dropped.

## Explicitly deferred from V2, per the original V2 plan

- **Revenue analytics.** No in-app payment processor exists — drops and
  mentor sessions both resolve externally. Faking revenue numbers from
  external, unverified purchases would violate the brand doctrine's "nothing
  fake" rule. Blocked on a payment processor decision.
- **Mentor payments/payouts.** V2 ships session coordination (request →
  confirm → complete) with no money movement. Real payouts need a processor
  decision and compliance work (1099s/tax handling if in the US, mentor
  payout scheduling) that shouldn't be rushed into a single phase.
- **Full DM/chat platform.** V2 ships one primitive — 1:1 connections
  (Phase 6) — deliberately scoped down from real-time messaging. A full chat
  system (threads, media, delivery receipts, moderation at message scale) is
  a separate infrastructure investment.
- **AI coach ("The Monk").** Sketched in early MONARQ planning notes. Large
  and separate: model behavior, personalization data, safety review. Would
  have diluted V2's focus.
- **In-app live rooms/calls.** The event + external join-link pattern
  (reused for mentor sessions in Phase 8) is sufficient for V2. Native voice/
  video infrastructure is a later, larger investment.
- **Local chapters/meetups.** Interesting long-term, not a dependency for
  anything else built in V2.

## Gaps surfaced while building V2, not yet addressed

- **Multi-member pods.** Phase 6 built 1:1 connections only — the plan's own
  "small pods" language was scoped down to the smallest possible pod (a
  pair), since Phase 6 explicitly predates any team-formation UI. Real pods
  (3+ members, shared space, pod-level accountability) is natural V3 scope
  once 1:1 connections are validated.
- **Teachings admin CRUD.** Teachings/tracks are still seeded by hand via
  SQL — there's no admin UI to create or edit a teaching, track, or
  mentor-track assignment (mentor linkage is documented as a direct SQL
  operation in `/admin/mentors`). Challenges and Drops both got admin CRUD
  during V2; Teachings didn't, purely on scope grounds.
- **Drop-tier admin editing.** Tiers can be created but not edited or
  reordered from `/admin/seasons` — only new-tier creation exists. Minor,
  but worth closing before drops/tiers get more configuration-heavy.
- **True proactive nudges.** The Phase 3 at-risk banner and Phase 3
  notification only fire when a member is already in the app (no scheduled
  job runner exists in this codebase). A real "evening reminder before you
  miss a day" requires a Vercel Cron job — deliberately deferred at Phase 3
  when this was raised, and still open.
- **Mentor availability beyond a toggle.** Phase 8 gives mentors a binary
  "accepting requests" switch, not real calendar/time-slot availability.
  Fine for V2's request-based flow; a real scheduling UI is a natural
  extension once mentor volume justifies it.

## Housekeeping

- `lib/supabase/types.ts` is hand-authored and has been extended by every
  phase. It should be regenerated from the live schema
  (`supabase gen types typescript --linked`) once the project is CLI-linked,
  to catch any drift between the hand-authored types and reality.
- No automated test suite exists anywhere in this codebase. Every V2 phase
  was verified via `tsc --noEmit`, `eslint`, `next build`, and Supabase
  advisors — real but shallow verification (it catches type errors and
  build failures, not behavioral regressions). Worth a real test suite
  before V3 adds more surface area.
