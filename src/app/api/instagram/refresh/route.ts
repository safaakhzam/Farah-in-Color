import { NextResponse, type NextRequest } from "next/server";
import { getInstagramToken } from "@/lib/instagram";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/supabase/env";

/**
 * Instagram long-lived tokens expire after 60 days. Vercel Cron calls this
 * route once a month (see vercel.json) to swap the token for a fresh one and
 * store it in the database, so the feed never stops working.
 */
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemoMode) return NextResponse.json({ skipped: "demo mode" });

  const token = await getInstagramToken();
  if (!token) return NextResponse.json({ skipped: "no token configured" });

  const res = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: `Instagram returned ${res.status}` }, { status: 502 });
  const json = (await res.json()) as { access_token: string; expires_in: number };

  await createSupabaseAdminClient()
    .from("settings")
    .update({ instagram_token: json.access_token, instagram_token_refreshed_at: new Date().toISOString() })
    .eq("id", 1);

  return NextResponse.json({ ok: true, expiresInDays: Math.round(json.expires_in / 86400) });
}
