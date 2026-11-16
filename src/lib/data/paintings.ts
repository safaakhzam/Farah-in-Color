import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/supabase/env";
import { samplePaintings } from "@/lib/sample-data";
import type { Painting } from "@/lib/types";

/** Anonymous (public) client: only allowed to read paintings, thanks to RLS. */
function publicClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
}

function normalize(row: Record<string, unknown>): Painting {
  const r = row as unknown as Painting;
  return {
    ...r,
    price_usd: Number(r.price_usd),
    width_cm: r.width_cm == null ? null : Number(r.width_cm),
    height_cm: r.height_cm == null ? null : Number(r.height_cm),
    colors: r.colors ?? [],
    images: Array.isArray(r.images) ? r.images : [],
  };
}

/** All paintings, newest first (sort_order lets the artist pin pieces to the top). */
export async function getPaintings(): Promise<Painting[]> {
  if (isDemoMode) return samplePaintings;
  const { data, error } = await publicClient()
    .from("paintings")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[paintings] load failed:", error.message);
    return [];
  }
  return data.map(normalize);
}

export async function getPaintingBySlug(slug: string): Promise<Painting | null> {
  if (isDemoMode) return samplePaintings.find((p) => p.slug === slug) ?? null;
  const { data, error } = await publicClient().from("paintings").select("*").eq("slug", slug).maybeSingle();
  if (error) console.error("[paintings] load failed:", error.message);
  return data ? normalize(data) : null;
}

export async function getPaintingById(id: string): Promise<Painting | null> {
  if (isDemoMode) return samplePaintings.find((p) => p.id === id) ?? null;
  const { data } = await publicClient().from("paintings").select("*").eq("id", id).maybeSingle();
  return data ? normalize(data) : null;
}

export async function getFeaturedPaintings(limit = 6) {
  const all = await getPaintings();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

/** Distinct collections / styles / colours, used to build the shop filters. */
export function facetsOf(paintings: Painting[]) {
  const uniq = (xs: (string | null | undefined)[]) =>
    [...new Set(xs.filter((x): x is string => Boolean(x)))].sort((a, b) => a.localeCompare(b));
  return {
    collections: uniq(paintings.map((p) => p.collection)),
    styles: uniq(paintings.map((p) => p.style)),
    colors: uniq(paintings.flatMap((p) => p.colors)),
    maxPrice: Math.max(0, ...paintings.map((p) => p.price_usd)),
  };
}
