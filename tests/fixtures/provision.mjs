// One-time (idempotent) provisioning of disposable test accounts for the
// RLS/security-definer test suite. Uses only the public anon key — the
// same credential the app itself uses — never a service-role key or a
// direct Postgres connection. Membership activation (status/role) is done
// separately via the Supabase MCP's already-elevated SQL connection, not
// by this script, so no elevated credential ever needs to live in a local
// env file.
//
// Run with: node --env-file=.env.local --env-file=.env.test.local tests/fixtures/provision.mjs

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const FIXTURES = [
  { key: "MEMBER_A", email: "monarq-test-member-a@example.com" },
  { key: "MEMBER_B", email: "monarq-test-member-b@example.com" },
  { key: "MENTOR_A", email: "monarq-test-mentor-a@example.com" },
  { key: "ADMIN_A", email: "monarq-test-admin-a@example.com" },
];

async function signUp(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) {
    // Idempotent: a prior run already created this account — fine.
    if (body.error_code === "user_already_exists" || res.status === 422) {
      console.log(`  already exists: ${email}`);
      return null;
    }
    throw new Error(`signup failed for ${email}: ${JSON.stringify(body)}`);
  }
  console.log(`  created: ${email} (${body.user?.id})`);
  return body.user?.id ?? null;
}

for (const f of FIXTURES) {
  const password = process.env[`TEST_${f.key}_PASSWORD`];
  if (!password) {
    throw new Error(`Missing env var TEST_${f.key}_PASSWORD`);
  }
  await signUp(f.email, password);
}

console.log(
  "\nDone. Now activate memberships/roles via Supabase MCP execute_sql — " +
    "this script intentionally cannot do that step itself."
);
