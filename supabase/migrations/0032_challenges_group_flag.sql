-- MONARQ OS — V2 Phase 4: group challenge flag
-- Run after 0001–0031. Additive only.
--
-- A "group" challenge doesn't introduce a new scoring mechanism — individual
-- completion XP already flows into seasonal standing automatically via
-- xp_events (see lib/seasons.ts's getSeasonPoints). This flag only changes
-- what the challenge UI shows: a shared "N of M active members completed
-- this" progress count instead of (or alongside) the individual join/complete
-- flow. No team/pod model exists yet (that's Phase 6), so this is
-- deliberately just a visibility layer, not real team formation.

alter table public.challenges add column is_group boolean not null default false;
