# MONARQ OS — V4 Plan

Planning only — no code written against this document yet. Written
2026-07-25, immediately after V3 shipped to production. Grounded in a
direct query of the live database, not in what the V3 plan assumed would
be true by now. See "What was verified" at the end.

---

## Part 1 — What the data actually says

The headline numbers from the admin dashboard are misleading. Broken down
by what the accounts really are:

| Account kind | Active | Onboarded | Has identity marker |
|---|---|---|---|
| **Real accounts** | **3** (1 is the admin) | 3 | 2 |
| Test fixtures (`monarq-test-*`) | 8 | 4 | 0 |
| Legacy anonymous sign-ins | 4 | 4 | 0 |

And 18 accounts sit in `pending`: **none of them are real people** — 12
are `monarq-test-redeem-*` rows the automated test suite created (it signs
up a fresh disposable account per run and cannot delete them), and 6 are
anonymous sign-ins left over from before V2 Phase 1 replaced that entry
path.

So MONARQ has **two real members plus you.**

Now the content those members would see:

| Surface | Rows | Consequence |
|---|---|---|
| Teachings (published) | **0** | Library is blank |
| Challenges (published) | **0** | Challenges page is blank |
| Events | **0** | Events page is blank |
| Drops (published) | **0** | Drops page is blank |
| Seasons (active) | **0** | Season module, tier badges and the season leaderboard all render empty or degraded |
| Tiers | **0** | Nothing to rank into; drop tier-gating has no tiers to gate on |
| Pods | 0 | Shipped in V3 Phase 3, never used |
| Pod messages / DMs | 0 / 0 | Shipped hours ago, never used |
| Accepted connections | 0 | Circle is empty |
| Mentors / requests | 1 / 0 | Marketplace has one mentor and no demand |
| Active habits | 4 | Across all real members |
| Check-ins, last 7 days | 4 | The core loop is barely running |

**45 migrations and roughly 30 feature phases across V1–V3 have produced
an application that is, from a member's point of view, almost entirely
empty.**

### The uncomfortable consequence

The admin dashboard is currently reporting fiction. Retention, connection
density, challenge completion rate and "active this week" are all computed
over 15 "active members" of whom 12 are test or legacy junk. This project's
own brand doctrine has an explicit *nothing fake* rule — right now the
analytics violate it, not by design but by accumulated debris.

---

## Part 2 — Recommendation: V4 is not a feature release

Every previous version answered "what should we build next?". Given the
numbers above, that is the wrong question for V4. The binding constraint
is not missing features — it is that **nothing is in the app and almost
nobody is using it.**

Building a tenth feature surface on top of nine empty ones adds
maintenance cost, RLS surface and migration count while changing nothing a
member experiences. I'd sequence V4 as: make the data honest, fill the
app, pay down the debt that will bite once real people arrive, then let
observed usage — not a roadmap written in advance — decide what gets built.

If you disagree with that framing, the phases below still work as a menu;
but I'd rather say plainly that more features is not what this codebase
needs right now.

---

## Part 3 — The V4 Roadmap

### Phase 0 — Make the numbers true
**What it adds:** Purge the 12 test-redeem accounts, the 6 legacy
anonymous accounts, and the 8 stale test fixtures from live data — then
stop them recurring. The test suite can now clean up after itself:
`SUPABASE_SERVICE_ROLE_KEY` arrived in V3 Phase 2, so a teardown path
exists that didn't when the suite was written (`tests/setup/clients.ts`
deliberately avoided elevated credentials, and its own comment documents
this as a known limitation).
**Why first:** Every dashboard number, every retention metric and every
future decision made from them is wrong until this is done. It is also
the cheapest phase in the document.
**Needs from you:** Confirmation that the 4 legacy anonymous accounts are
genuinely abandoned before I delete them.

### Phase 1 — Fill the app
**What it adds:** Actual content, through the admin UI that V3 Phase 1
built for exactly this and has never been used in anger: a first season
with tiers, a starting set of teachings and tracks, the first challenges,
the first events.
**Why here:** This is the single highest-impact change available. A new
member currently lands on blank pages — no teachings to read, no challenge
to join, no tier to climb toward. Every retention feature built in V2 and
V3 is dark because there is nothing to retain anyone *with*.
**Needs from you — this phase is mostly yours, not mine:** I can build
tooling, seed structures and write scaffolding, but I cannot invent
MONARQ's actual teachings. The content is the product here. What I *can*
do is convert material from `docs/obsidian/` into draft teachings for you
to edit, and define a sensible first season and tier ladder for you to
approve.

### Phase 2 — Close the engineering debt that will bite
**What it adds:** Three specific things, all of which got worse during V3:
1. **`lib/supabase/types.ts` is hand-patched again.** V3 Phase 0
   regenerated it precisely to end this, and then Phases 3, 4, 7 and the
   access-code work all patched it by hand because regeneration wasn't
   wired into anything. Add a `npm run types:generate` script and use it.
2. **No CI.** There is no `.github/workflows` at all. 83 tests exist and
   run only when someone remembers. A push that breaks RLS deploys to
   production unchallenged — as nearly happened when the access-code
   change silently dropped `drop_claims` and case-insensitive matching.
3. **Migrations still aren't tracked** by Supabase's own migration system
   (flagged in V3 Part 4 and still true at 45 files). Every one has been
   applied by hand via MCP. This gets more expensive to reconcile, never
   less.
**Why here:** All three are cheap now and compounding. CI in particular is
what makes it safe to move fast once there are real members to break
things for.
**Needs from you:** Nothing.

### Phase 3 — First-run experience and the invite loop
**What it adds:** The path a real invited member actually walks — from
receiving a code to their first check-in — treated as a designed flow
rather than an assembled one. Includes the empty states that Phase 1 will
no longer make moot but which still need to be right (what a member sees
in a pod of one, a Circle with no connections, a season just started), and
an honest look at why only 2 of 3 real accounts ever set an identity
marker.
**Why here:** After Phase 1 there is finally something to onboard *into*.
Before it, polishing first-run is polishing a walk through empty rooms.
**Needs from you:** A few real invite codes issued to real people, and
their feedback.

### Phase 4 — Instrument the loop before extending it
**What it adds:** Fix the admin analytics to exclude non-real accounts
(depends on Phase 0), and add the few numbers that would actually inform
V5: how many invited members complete onboarding, how many log a second
day, which surfaces get opened at all.
**Why here:** Deliberately after real members exist. Instrumentation built
before there is traffic measures nothing.
**Needs from you:** Nothing.

### Phase 5+ — Earned by usage, not planned in advance
I'm not going to pre-scope these. The honest answer is that V3 shipped
pods, mentor scheduling and messaging into an app where all three have
zero usage, and I don't want to repeat that. Once Phases 0–4 are done and
real members are actually in, what to build next should be obvious from
what they do and complain about. Candidates carried forward, not
committed to: deeper pod tooling, mentor availability recurrence,
richer teachings formats.

---

## Part 4 — Still deferred, and why

- **Live rooms / video calls.** Needs a third-party video vendor. Also a
  paid one at any real scale, which conflicts with the free-tier
  constraint. The existing event + external join-link pattern remains a
  working substitute.
- **Local chapters.** Still a tenancy dimension the schema has never had;
  retrofitting `chapter_id` across 45 migrations' worth of tables and
  policies is a large, genuinely separate project. Nothing depends on it.
- **AI coach (was V3 Phase 8).** Blocked outright by the no-paid-API-keys
  constraint — it needs a paid model API. Revisit only if that constraint
  changes.
- **Payments, commerce, revenue analytics.** Cancelled permanently, not
  deferred. MONARQ carries no commerce; drops sell elsewhere.

---

## Part 5 — Operational items outstanding right now

Not phases, but real and currently true:

1. **The daily nudge cron does nothing.** `SUPABASE_SERVICE_ROLE_KEY` and
   `CRON_SECRET` are not set in Vercel Production, so every scheduled
   invocation is rejected with 401. See `docs/RATE-LIMITING.md`.
2. **The GitHub repo is public.** Everything in `docs/` — this plan, the
   V3 plan, brand doctrine, the Obsidian business notes — is world
   -readable. No credentials are exposed; the strategy material is.
3. **Supabase Free pauses projects after ~7 days of low activity.** With
   traffic this low that is the most likely cause of an unexplained
   outage.
4. **Supabase auth rate limits and the Vercel WAF rules** are documented
   but not yet applied — both are dashboard actions only you can take.

---

## What was verified for this document (not assumed)

- Live row counts across 19 tables, queried directly.
- Account composition broken down by real / test-fixture / legacy-anonymous,
  joined across `auth.users`, `memberships` and `profiles` — this is what
  revealed that "15 active members" is really 3.
- The 18 `pending` accounts enumerated individually by email and signup
  date; all 18 accounted for as test or legacy.
- `.github/workflows` confirmed absent.
- `supabase/migrations/` counted: 45 files.
- Production smoke-tested after the V3 deploy: `/login` 200, unauthenticated
  `/home` 307 → `/login`, `/api/cron/nudges` 401 with and without a bad
  token.
