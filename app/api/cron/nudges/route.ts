import { createServiceClient } from "@/lib/supabase/service";
import { notifyAtRiskMembers } from "@/lib/nudges";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const service = createServiceClient();
    const result = await notifyAtRiskMembers(service);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron/nudges] failed:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
