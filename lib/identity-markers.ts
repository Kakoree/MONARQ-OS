import { createClient } from "@/lib/supabase/server";

export type IdentityMarker = {
  id: string;
  name: string;
  description: string | null;
};

export async function getActiveIdentityMarkers(): Promise<IdentityMarker[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("identity_markers")
    .select("id, name, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}
