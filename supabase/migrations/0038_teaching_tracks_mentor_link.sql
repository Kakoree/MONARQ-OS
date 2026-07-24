-- MONARQ OS — V2 Phase 7: mentor-led track attribution
-- Run after 0001–0036. Additive only.
--
-- teaching_categories already is the "track" grouping (name + sort_order);
-- this doesn't rename or restructure it, just attributes a track to a
-- mentor so the teachings UI can show which paths are mentor-led. Existing
-- teaching_categories_select_active_member / admin_write RLS (0008) already
-- covers this new column.

alter table public.teaching_categories
  add column mentor_id uuid references public.mentors (id) on delete set null;
