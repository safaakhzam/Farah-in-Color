import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption: string;
}

/**
 * The access token comes from the database (kept fresh by the monthly cron at
 * /api/instagram/refresh) or, if not there yet, from INSTAGRAM_ACCESS_TOKEN.
 */
export async function getInstagramToken(): Promise<string | null> {
  if (!isDemoMode && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data } = await createSupabaseAdminClient()
      .from("settings")
      .select("instagram_token")
      .eq("id", 1)
      .maybeSingle();
    if (data?.instagram_token) return data.instagram_token;
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

/**
 * Latest posts via the Instagram API (Instagram Login). Cached for one hour.
 * Returns an empty list on any problem so the page falls back to the static grid.
 */
export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = await getInstagramToken();
  if (!token) return [];
  try {
    const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=${limit * 2}&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      data: { id: string; caption?: string; media_type: string; media_url?: string; thumbnail_url?: string; permalink: string }[];
    };
    return json.data
      .map((m) => ({
        id: m.id,
        imageUrl: (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) ?? "",
        permalink: m.permalink,
        caption: m.caption ?? "",
      }))
      .filter((p) => p.imageUrl)
      .slice(0, limit);
  } catch (e) {
    console.error("[instagram] feed unavailable:", e);
    return [];
  }
}
