// Elevated teardown, used only by afterAll hooks.
//
// The suite still exercises RLS exclusively through real signed-in users
// on the anon key (see clients.ts) — that has not changed and must not.
// This is separate: cleanup of rows and auth users that RLS deliberately
// gives no client any way to delete, which is why disposable test
// accounts and their notifications accumulated in production data until
// V4 Phase 0. SUPABASE_SERVICE_ROLE_KEY only became available in V3
// Phase 2, after this suite was written.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasServiceKey(): boolean {
  return !!SERVICE_KEY;
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${URL}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY!,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

// Removes the auth user and everything cascading from it (profile,
// membership, redemptions, notifications...). Best-effort: teardown must
// never fail a green test run.
export async function deleteTestUser(userId: string): Promise<void> {
  if (!SERVICE_KEY || !userId) return;
  try {
    await adminFetch(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
  } catch {
    // Ignore — cleanup is not an assertion.
  }
}

export async function deleteTestUsers(userIds: string[]): Promise<void> {
  for (const id of userIds) await deleteTestUser(id);
}

// notifications has no delete policy for anyone (0026), by design, so
// fixture accounts otherwise accrue rows from every run that triggers one.
export async function clearNotificationsFor(userIds: string[]): Promise<void> {
  if (!SERVICE_KEY || userIds.length === 0) return;
  try {
    const list = userIds.map((id) => `"${id}"`).join(",");
    await adminFetch(`/rest/v1/notifications?user_id=in.(${list})`, {
      method: "DELETE",
    });
  } catch {
    // Ignore.
  }
}
