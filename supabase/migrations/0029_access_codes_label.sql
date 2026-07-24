-- MONARQ OS — V2 Phase 1: access code recipient label
-- Run after 0001–0028. Additive only.
--
-- V2's real-identity entry model: admin creates a one-time code, it's
-- delivered to a specific person out of band (in person, as a letter — not
-- something this app does), and they redeem it while creating their real
-- account. `label` is admin-only bookkeeping for who a given code was
-- actually sent to — it has no effect on redemption logic.

alter table public.access_codes add column label text;
