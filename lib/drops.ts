import { createClient } from "@/lib/supabase/server";

export type DropStatus = "upcoming" | "live" | "ended" | "sold_out";

export type DropSummary = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  isKeyDrop: boolean;
  priceCents: number | null;
  currency: string;
  externalUrl: string | null;
  status: DropStatus;
};

type DropRow = {
  is_sold_out: boolean;
  available_from: string | null;
  available_until: string | null;
};

function computeStatus(drop: DropRow): DropStatus {
  if (drop.is_sold_out) return "sold_out";

  const now = Date.now();
  if (drop.available_from && new Date(drop.available_from).getTime() > now) {
    return "upcoming";
  }
  if (drop.available_until && new Date(drop.available_until).getTime() < now) {
    return "ended";
  }
  return "live";
}

const DROP_COLUMNS =
  "id, title, description, image_url, is_key_drop, price_cents, currency, external_url, is_sold_out, available_from, available_until";

function toSummary(d: {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_key_drop: boolean;
  price_cents: number | null;
  currency: string;
  external_url: string | null;
  is_sold_out: boolean;
  available_from: string | null;
  available_until: string | null;
}): DropSummary {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    imageUrl: d.image_url,
    isKeyDrop: d.is_key_drop,
    priceCents: d.price_cents,
    currency: d.currency,
    externalUrl: d.external_url,
    status: computeStatus(d),
  };
}

export async function getDrops(): Promise<DropSummary[] | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: drops } = await supabase
    .from("drops")
    .select(DROP_COLUMNS)
    .order("available_from", { ascending: true, nullsFirst: false });

  return (drops ?? []).map(toSummary);
}

export async function getDrop(id: string): Promise<DropSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: drop } = await supabase
    .from("drops")
    .select(DROP_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!drop) return null;

  return toSummary(drop);
}
