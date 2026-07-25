// The hand-maintained half of the Supabase types.
//
// Everything generated from the live schema lives in ./database.types.ts
// and is overwritten wholesale by `npm run types:generate`. Nothing in
// that file should ever be edited by hand — this file exists so that
// regenerating cannot clobber the aliases below, which is exactly what
// kept happening: V3 Phase 0 regenerated the types specifically to end
// hand-maintenance, and then Phases 3, 4 and 7 each hand-patched the
// generated file again because there was nowhere else to put anything.

export type {
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "./database.types";

export { Constants } from "./database.types";

import type { Database } from "./database.types";

// --- Convenience aliases used throughout lib/ and app/ ---------------------
// MembershipStatus/MemberRole/ConnectionStatus/MentorshipRequestStatus are
// real Postgres enums, derived directly from the generated Database type
// so they can never drift from the schema.
export type MembershipStatus = Database["public"]["Enums"]["membership_status"];
export type MemberRole = Database["public"]["Enums"]["member_role"];
export type ConnectionStatus = Database["public"]["Enums"]["connection_status"];
export type MentorshipRequestStatus =
  Database["public"]["Enums"]["mentorship_request_status"];

// reports.status is a plain `text` column with a CHECK constraint, not a
// real Postgres enum (see 0035_reports.sql) — generation correctly reflects
// it as `string`. This narrowed alias is hand-maintained on purpose; keep
// it in sync with the CHECK constraint if that ever changes.
export type ReportStatus = "open" | "resolved" | "dismissed";
