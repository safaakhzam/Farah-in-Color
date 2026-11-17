"use server";

import { getPaintings } from "@/lib/data/paintings";

/** Live data for the paintings in a visitor's cart (to catch ones sold meanwhile or price changes). */
export async function getCartPaintings(ids: string[]) {
  const wanted = new Set(ids.slice(0, 20));
  const all = await getPaintings();
  return all
    .filter((p) => wanted.has(p.id))
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price_usd,
      image: p.images[0]?.url ?? "",
      medium: p.medium,
      status: p.status,
    }));
}
