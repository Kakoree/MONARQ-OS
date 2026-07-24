import { createClient } from "@/lib/supabase/server";

export type MentorLoad = {
  mentorId: string;
  pendingCount: number;
  confirmedCount: number;
};

export async function getMentorLoad(): Promise<Map<string, MentorLoad>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mentorship_requests")
    .select("mentor_id, status")
    .in("status", ["pending", "confirmed"]);

  const load = new Map<string, MentorLoad>();
  for (const r of data ?? []) {
    const entry = load.get(r.mentor_id) ?? {
      mentorId: r.mentor_id,
      pendingCount: 0,
      confirmedCount: 0,
    };
    if (r.status === "pending") entry.pendingCount += 1;
    else if (r.status === "confirmed") entry.confirmedCount += 1;
    load.set(r.mentor_id, entry);
  }

  return load;
}

export type MentorAnalyticsSummary = {
  totalRequests: number;
  sessionsCompleted: number;
  memberReach: number;
  completionRate: number;
  avgResponseHours: number | null;
};

// "Completion rate" is completed / all requests ever made — the honest
// end-to-end read on whether a request actually becomes a session, not
// just completed / confirmed (which would hide mentors who never respond).
export async function getMentorAnalyticsSummary(): Promise<MentorAnalyticsSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mentorship_requests")
    .select("member_id, status, created_at, responded_at");

  const rows = data ?? [];
  const totalRequests = rows.length;
  const sessionsCompleted = rows.filter((r) => r.status === "completed").length;
  const memberReach = new Set(rows.map((r) => r.member_id)).size;

  const responded = rows.filter((r) => r.responded_at);
  const avgResponseHours =
    responded.length > 0
      ? responded.reduce((sum, r) => {
          const hours =
            (new Date(r.responded_at as string).getTime() - new Date(r.created_at).getTime()) /
            3_600_000;
          return sum + hours;
        }, 0) / responded.length
      : null;

  return {
    totalRequests,
    sessionsCompleted,
    memberReach,
    completionRate: totalRequests > 0 ? Math.round((sessionsCompleted / totalRequests) * 100) : 0,
    avgResponseHours,
  };
}

export type MentorSessionsPoint = { date: string; count: number };

// Completed sessions bucketed by their scheduled date — reflects when
// sessions actually happened, not when the request was made.
export async function getMentorSessionsTrend(days = 30): Promise<MentorSessionsPoint[]> {
  const supabase = await createClient();

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const { data } = await supabase
    .from("mentorship_requests")
    .select("scheduled_at")
    .eq("status", "completed")
    .gte("scheduled_at", start.toISOString());

  const countByDate = new Map<string, number>();
  for (const r of data ?? []) {
    if (!r.scheduled_at) continue;
    const date = r.scheduled_at.slice(0, 10);
    countByDate.set(date, (countByDate.get(date) ?? 0) + 1);
  }

  const points: MentorSessionsPoint[] = [];
  const cursor = new Date(start);
  for (let i = 0; i < days; i++) {
    const dateStr = cursor.toISOString().slice(0, 10);
    points.push({ date: dateStr, count: countByDate.get(dateStr) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return points;
}
