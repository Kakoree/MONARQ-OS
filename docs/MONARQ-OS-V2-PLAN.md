# MONARQ OS V2 — Product Definition & Execution Roadmap

*Grounded in the existing MONARQ doctrine (`docs/obsidian/MONARQ OS ROADMAP NOTES`, `DOMAINS NOTES`) and the actual V1 codebase as it stands today.*

---

## PART 1 — Defining V2

### What V2 is

V1 proved the core loop: gated entry, daily habits, XP/levels, challenges, community feed, teachings, drops, and a basic admin layer all exist and work. What V1 has not yet proven is that MONARQ is an **operating system** rather than a **dashboard with a habit tracker bolted on**. Right now the pieces sit next to each other. They don't yet reinforce each other.

**V2 is the phase where MONARQ's domains stop being adjacent and start being interconnected** — where habits feed rank, rank unlocks drops, drops become visible identity, community makes that identity witnessed, teachings deepen into mentor-led progression, and admin gets the instrumentation to actually run all of it as a living ecosystem rather than a collection of CRUD screens.

Concretely, V2 introduces:
- A **mentor marketplace** (directory → structured tracks → session requests → mentor analytics)
- A **seasonal ranking layer** (tiers/titles on top of the existing lifetime XP/Level)
- **Habit/streak intelligence** (recovery mechanics, at-risk detection, richer trend data)
- **Onboarding automation** (a real first-session journey, not a bare code-redemption form)
- **Member-to-member connection tools** (lightweight, not a full chat platform)
- **Drops tied to status and identity** (tier-gated access, visible ownership)
- **An admin command center** (configurable rules, mentor controls, consolidated retention/engagement analytics)

### What V2 is trying to become, at a product level

V1 answers: *"What do I do today?"*
V2 must answer the second half of MONARQ's core question: *"...and what does it make me become?"*

That "becoming" has to be visible, social, and cumulative — not just a bigger number on a profile page. V2's job is to make **status legible** (you can see your tier, your streak health, your mentor path, your owned drops) and **status earned** (never purchased outright, never inflated, always traceable to real behavior — per the Brand Doctrine's explicit rejection of "fake flex" and "manufactured" status).

### Distinguishing V2 from V1

| | V1 | V2 |
|---|---|---|
| **Ranking** | One lifetime XP number, derived level | Lifetime level *plus* a seasonal tier/title layer that resets and re-opens competition |
| **Habits** | Flat daily checklist, binary streak (miss one day, streak dies) | Recovery mechanics, at-risk detection, per-habit trend intelligence |
| **Onboarding** | Access-code form → dashboard, zero ritual | Guided identity-marker sequence, first habit set up before session ends, public welcome |
| **Community** | One-way feed (post, react, comment) | Feed *plus* lightweight member-to-member connection |
| **Teachings** | Flat content library | Leveled tracks, some mentor-led |
| **Mentorship** | Doesn't exist | Directory → structured tracks → session requests → admin analytics |
| **Drops** | Flat list, external purchase link, first-come | Tier-gated visibility/early access, ownership shown as identity |
| **Admin** | Member/access-code/moderation/audit CRUD + the analytics dashboard shipped this session | Configurable points/tier rules, mentor controls, consolidated retention/engagement intelligence |
| **Dashboard** | Sparse two-stat shell (fixed this session) | Already resolved — V2 *extends* the existing Motion/Bklit composition system, doesn't rebuild it |

### Core product pillars of V2

1. **Status must be earned and visible.** Every new system (seasons, drops, mentors) ties back to real behavior and shows up where other members can see it.
2. **Discipline compounds into identity, not just points.** Streak/habit intelligence exists to protect the *behavior*, not just the *number*.
3. **Belonging needs more than a feed.** Community must let members actually reach each other, not just broadcast at each other.
4. **Mastery has a path, not just a library.** Teachings and mentorship become structured progression, not passive content.
5. **Admin runs an ecosystem, not a database.** Every member-facing system in V2 ships with the control and visibility admin needs to operate it.
6. **Nothing ships fake.** No placeholder metrics, no simulated payments, no invented "AI coach" bolted on without the infrastructure to back it. If a feature can't be real yet, it's explicitly deferred, not faked.

### What definitely belongs in V2

- Notification infrastructure (foundation dependency for nearly everything below)
- Real identity/onboarding upgrade (the current access-code-only flow is explicitly marked temporary in the codebase)
- Habit/streak intelligence: recovery mechanics, at-risk detection, richer trend charts
- Seasonal tiers/titles layered on the existing XP/Level system
- Challenge evolution: seasonal, group-stakes challenges tied to the tier system
- Lightweight member-to-member connection (not full messaging)
- Teachings restructured into leveled tracks
- Mentor marketplace: directory, structured mentor-led tracks, session *requests* (not payments)
- Mentor-specific admin analytics
- Drops tied to tier/status: gated visibility, early access, visible ownership
- Configurable points/tier rules in admin (replacing the current hardcoded formula)
- Consolidated admin analytics across retention, engagement, and churn signals

### What should wait until later (V3+)

Called out explicitly, not left ambiguous:

- **Revenue analytics.** MONARQ has no in-app payment processing today — drops and (in V2) mentor sessions both resolve externally. Revenue cannot be honestly measured until a real payment processor is integrated. Admin analytics in V2 covers retention/engagement/churn; revenue is a named V3 dependency, not something to fake with placeholder numbers.
- **Mentor payments/payouts.** V2 ships session *requests and coordination*; compensating mentors is a manual/external process in V2. Real in-app payments require a processor decision and compliance work that shouldn't be rushed into a single V2 phase.
- **Full messaging/DM platform.** V2 ships lightweight connection primitives (Phase 6). A real chat system (threads, media, moderation at message scale) is a V3 investment.
- **AI coach ("The Monk").** Already sketched in earlier MONARQ planning notes as a post-V1 idea, but it's a large, separate initiative (model behavior, personalization data, safety) that would dilute V2's focus if squeezed in. V3 candidate.
- **In-app live rooms/calls.** The existing event + external join-link pattern is sufficient for V2. Native live infrastructure is a later investment.
- **Local chapters/meetups.** Interesting long-term, not a V2 dependency for anything else.

---

## PART 2 — The 10-Phase Roadmap

Each phase builds on data or infrastructure the prior phase created. No phase requires inventing a new cross-cutting system mid-stream — that's deliberate; it's the difference between a roadmap and a backlog.

### Phase 1 — Platform Foundations
**Objective:** Build the infrastructure every later V2 feature depends on, before any of them are built.

**Why it matters:** Notifications, real identity, and a season/tier data model aren't features members will point to — they're the plumbing that makes every subsequent phase possible. Building them retroactively once four features already assume they exist is expensive rework.

**What belongs here:**
- Event-driven notification system (in-app + email), consumed by every later phase
- Upgrade the temporary access-code-only login to real member identity (the codebase already flags this as a "TEMPORARY V1 TESTING ENTRY" needing replacement before real launch)
- Season/tier schema: seasons, tier definitions, title assignment — a new layer, not a replacement for the existing XP/Level system
- Habit-recovery schema: grace tokens / streak-freeze ledger

**Dependencies:** None. This is the starting point.

**Success looks like:** Every later phase can consume "notify this member," "what tier are they," and "do they have a recovery token" without inventing new plumbing.

**Type:** Backend-heavy.

---

### Phase 2 — Onboarding Automation & Identity Marker
**Objective:** Replace the bare access-code form with a real guided first session: entry → identity marker → first habit → public welcome.

**Why it matters:** The member journey explicitly starts with "Discovery → Entry → Onboarding," and the brief calls out avoiding "sentiment drops caused by confusion, dead time, or silence." Today, a new member redeems a code and lands on an empty dashboard with zero ritual. That's the single biggest gap between the current product and the intended journey.

**What belongs here:**
- Multi-step guided onboarding (replacing the current one-field form)
- Identity marker selection at signup (ties into the existing MONARQ lifestyle-archetype thinking — Athlete, Builder, Quiet Grinder, etc. — as a light, optional self-tag, not a rigid segmentation)
- Forced first-habit creation before the flow completes
- Automated welcome notification + public "new member" moment in the community feed
- Admin-configurable onboarding copy/sequencing (light admin touch, not a full builder)

**Dependencies:** Phase 1 (notifications, real identity).

**Success looks like:** A new member has a name, an identity marker, one active habit, and a public welcome — before their first session ends.

**Type:** Product-design-heavy, with supporting frontend work.

---

### Phase 3 — Habit & Streak Intelligence
**Objective:** Evolve habits from a flat daily checklist into an intelligent system with recovery mechanics and early-warning signals.

**Why it matters:** Habits are explicitly the engine of daily app opens. Today's streak logic is a naive consecutive-day counter — miss one day and months of streak vanish. That's a well-known churn trigger in habit products, and it directly contradicts a system meant to build discipline without punishing being human.

**What belongs here:**
- Grace-day / streak-freeze mechanics (earned through consistency, not bought)
- Missed-day recovery flow
- Per-habit trend history — extending the existing single aggregate trend chart into individual habit lines, using the Bklit chart layer already in place
- "At risk of lapsing" detection, feeding a recovery-nudge notification
- Weekly/monthly consistency scoring, feeding Phase 4's seasonal rank

**Dependencies:** Phase 1 (notifications, recovery-token schema); the existing habit/check-in data and chart layer.

**Success looks like:** Streak loss becomes rare and recoverable instead of punishing. Admin can see, in aggregate, who's trending toward lapsing.

**Type:** Backend-heavy, with frontend chart extension.

---

### Phase 4 — Seasonal Ranking, Titles & Challenge Evolution
**Objective:** Layer a resettable seasonal tier/title system on top of the existing lifetime XP/Level, and evolve challenges into the primary way members climb it.

**Why it matters:** A single ever-climbing lifetime number caps long-term excitement — early members plateau, late joiners feel permanently behind. Seasons re-open competition on a rhythm. Tying seasonal challenges to tier standing (instead of leaving challenges as a disconnected side system) makes both systems stronger together than either is alone.

**What belongs here:**
- Season definitions (admin-configurable start/end, tier thresholds, on-brand title names)
- Season leaderboard, separate from the existing lifetime leaderboard
- Group/team challenges with leaderboard stakes, scored into seasonal standing
- Admin controls for points and tier-threshold rules (replacing the current hardcoded XP formula)
- Season-end recap (what a member earned, where they landed)

**Dependencies:** Phase 1 (season/tier schema); existing XP ledger, challenges, leaderboard, chart layer.

**Success looks like:** A member can name their current tier, see the season clock running, and know that this week's challenge affects their standing.

**Type:** Backend-heavy + product-design.

---

### Phase 5 — Dashboard & Status Surfacing
**Objective:** Surface everything Phases 2–4 built into the Home dashboard and profile, using the Motion/Bklit composition system already shipped — not rebuilding it.

**Why it matters:** Features that exist only in the database don't create retention. Status has to be *seen* to reinforce identity. This phase is explicitly about visibility, not new backend systems — it's the return on the dashboard composition work already completed.

**What belongs here:**
- Profile redesign: identity marker, tier badge, archetype tag, milestones
- Home dashboard: season/tier module, recovery-state prompt when a habit is at risk
- Tier badges wherever a member appears — leaderboard, community feed, member directory — applied consistently, not redundantly

**Dependencies:** Phases 2–4 data; the existing Home/Motion/Bklit foundation.

**Success looks like:** A member's identity marker and tier are visible in at least four places without feeling repeated or cluttered.

**Type:** Frontend-heavy.

---

### Phase 6 — Member-to-Member Connection
**Objective:** Give members a way to actually reach each other — the "Belonging" journey stage — without building a full messaging platform.

**Why it matters:** Community today is one-way broadcast: post to the feed, react, comment. There's no way to connect with a specific person. That caps belonging at "I was seen" instead of "I know people here."

**What belongs here:**
- "Connect" action on member profiles
- Lightweight accountability pairing / small pods (a scoped version of the "circles/pods" concept already sketched in MONARQ's own post-V1 notes)
- Notification on connection
- Light moderation extension for reporting connection abuse

**Dependencies:** Phase 1 (notifications); existing community/member directory.

**Explicitly deferred:** Full DM/chat infrastructure — V3.

**Success looks like:** Members can signal and receive connection beyond a feed reaction. Admin can see connection density as an engagement signal.

**Type:** Backend + frontend, moderate scope.

---

### Phase 7 — Teachings Evolution & Mentor Marketplace Foundation
**Objective:** Restructure Teachings into leveled progressive tracks, and introduce the mentor marketplace as a directory and structured offering — not booking or payments yet.

**Why it matters:** Teachings today is a flat content library. The mentor marketplace is a genuinely new domain and shouldn't launch complete in one leap — the identity/directory layer needs to exist and be trustworthy before booking logic sits on top of it.

**What belongs here:**
- Teaching paths/levels replacing the flat list
- Mentor role (member → mentor, admin-approved) and mentor profile
- Mentor directory
- Mentor-led track attribution
- "Request mentorship" interest capture (no live booking engine yet)

**Dependencies:** Phase 1 (identity/roles); existing teachings content.

**Success looks like:** Members can browse structured tracks and see which are mentor-led. Mentors have a real, admin-approved profile.

**Type:** Product-design-heavy + backend.

---

### Phase 8 — Mentor Marketplace Depth & Mentor Analytics
**Objective:** Turn the Phase 7 foundation into a functioning marketplace — session requests and mentor admin analytics.

**Why it matters:** This is the harder half of the mentor marketplace, deliberately split from Phase 7 so the directory/identity layer has time to stabilize first. Admin explicitly needs mentor-specific analytics, which only becomes meaningful once real session activity exists.

**What belongs here:**
- Session request flow: requested → confirmed → completed (coordinated via the existing event/join-link pattern — no payment processing)
- Mentor availability
- Mentor admin panel: approve/deactivate, view mentor load
- Mentor analytics dashboard: sessions run, member reach, completion rate, response time — built on the existing Bklit chart layer

**Dependencies:** Phase 7 mentor profiles; Phase 1 notifications.

**Explicitly deferred:** Payments and payouts — V3, pending a payment-processor decision.

**Success looks like:** A member can request a session and it resolves to a scheduled outcome. Admin has a dedicated mentor analytics view.

**Type:** Backend-heavy + admin-data-heavy.

---

### Phase 9 — Drops, Identity & Status Linkage
**Objective:** Tie physical drops to rank and tier instead of a flat first-come list — drops become status objects, not merch.

**Why it matters:** This is a direct, explicit V2 requirement. The current drops model has no tier-gating at all — every drop is visible to every active member with no connection to status.

**What belongs here:**
- Tier-gated drop visibility and early-access windows
- Key-drop eligibility tied to season tier or milestone, not pure first-come
- Owned drops shown on profile as a visible identity marker
- Admin drop-tier configuration

**Dependencies:** Phase 4 (season/tier system); existing drops domain.

**Explicitly deferred:** In-app checkout/payments stay external, same as V1 — building real commerce processing is a separate infrastructure decision, not required to hit this phase's goal.

**Success looks like:** A drop can be configured as "Tier III and above, 24-hour early access." Owning a key visibly appears on a member's profile.

**Type:** Backend + frontend.

---

### Phase 10 — Final Integration, Consolidated Analytics & Polish
**Objective:** Bring every domain built in Phases 1–9 together into one coherent operator console, then harden and audit the whole system before calling V2 done.

**Why it matters:** A roadmap that ends with "and also build a huge new admin system" leaves no room to stabilize it. This phase is deliberately about integration, not new features — pulling the retention/engagement signals every prior phase already produced (habit at-risk from Phase 3, season participation from Phase 4, connection density from Phase 6, mentor performance from Phase 8, drop/tier engagement from Phase 9) into one consolidated admin view, extending the Admin Overview shipped this session rather than replacing it.

**What belongs here:**
- Consolidated retention/engagement/churn dashboard spanning every domain above
- Cross-feature QA: onboarding → habits → season → mentor → drops, walked end-to-end as one journey
- Brand-voice and copy audit against the Brand Doctrine (no fake-positive language, no corporate tone, no manufactured flex anywhere new copy was written)
- Performance and accessibility pass across everything new
- A written, explicit V3 backlog: revenue analytics, mentor payments, full messaging, AI coach, live rooms — carried forward, not silently dropped

**Dependencies:** Phases 1–9. Intentionally last.

**Success looks like:** An admin can run a season, approve a mentor, configure a drop's tier gate, and see who's at risk of churning — all from one coherent console. A member can go from onboarding to a mentor session to an owned key drop without hitting a dead end anywhere in between.

**Type:** Admin-data-heavy, full-system QA.

---

## PART 3 — The Finished V2 Product

### What a member sees daily

Home opens to a dashboard that already knows them: today's habits, a streak that forgives an occasional miss instead of punishing it, a visible season tier with a clock running, a nudge if something's at risk, and a rail showing what their circle is doing — leaderboard movement, an upcoming event, a friend's win in the feed. It reads like a command center for one person's self-mastery, not a to-do list.

### What makes members come back

Not notifications for their own sake — recovery, not guilt. A streak-freeze earned through consistency turns a missed Tuesday into a non-event instead of a reason to give up. A season with a real end date means there's always a reason to show up this week specifically, not just "eventually." Challenges with group stakes mean showing up affects people other than yourself.

### What creates belonging

Being seen, and being able to see back. The feed already lets members post wins and setbacks; V2 adds the ability to actually connect with the person who posted one — a pod, a pairing, a mentor. Belonging stops being "I posted and someone reacted" and becomes "I know who's in this with me."

### What creates status

Status that's *legible* and *earned*: a tier badge that means something because it resets and has to be re-earned, a mentor-led track completed and shown on a profile, a key drop that was only available because of standing, not because of a first-click race. Never a purchased number, never an invented flex — every status marker in V2 traces back to a real, checkable action.

### What makes admin able to run the ecosystem

A console where every domain built in V2 has a corresponding control: approve a mentor, configure a season's tier thresholds, gate a drop by tier, see which members are trending toward lapsing before they're gone, moderate a connection report. Admin stops being "a few CRUD pages next to the real app" and becomes the operating console for the whole club.

### What makes MONARQ OS different from a course app, a social app, or a habit tracker

A course app has content but no daily loop and no status. A social app has a feed but no structured progression and no discipline mechanic underneath it. A habit tracker has streaks but no community and no identity payoff. MONARQ OS is the only one of the three that connects **daily behavior → status → belonging → mastery → advocacy** into a single loop, where each piece makes the others more valuable — a habit checked today moves a season tier, a season tier unlocks a drop, a drop becomes a visible marker in the community that reinforces the identity that makes tomorrow's habit check-in feel worth doing again.

That loop — not any single feature in it — is what V2 is actually building.
