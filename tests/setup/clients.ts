import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Every call gets its own client + its own real session — these tests
// exercise RLS exactly as production traffic does (real signed-in users
// through the same anon key the app uses), never a service-role bypass.
export async function signInAs(
  email: string,
  password: string
): Promise<SupabaseClient<Database>> {
  const client = createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`sign-in failed for ${email}: ${error.message}`);
  }
  return client;
}

export const FIXTURES = {
  memberA: {
    email: process.env.TEST_MEMBER_A_EMAIL!,
    password: process.env.TEST_MEMBER_A_PASSWORD!,
    id: process.env.TEST_MEMBER_A_ID!,
  },
  memberB: {
    email: process.env.TEST_MEMBER_B_EMAIL!,
    password: process.env.TEST_MEMBER_B_PASSWORD!,
    id: process.env.TEST_MEMBER_B_ID!,
  },
  mentorA: {
    email: process.env.TEST_MENTOR_A_EMAIL!,
    password: process.env.TEST_MENTOR_A_PASSWORD!,
    id: process.env.TEST_MENTOR_A_ID!,
  },
  adminA: {
    email: process.env.TEST_ADMIN_A_EMAIL!,
    password: process.env.TEST_ADMIN_A_PASSWORD!,
    id: process.env.TEST_ADMIN_A_ID!,
  },
} as const;

export function anonClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
