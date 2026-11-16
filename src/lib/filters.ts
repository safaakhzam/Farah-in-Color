import { sizeBand } from "./format";
import type { Painting } from "./types";

export const PRICE_RANGES = [
  { value: "0-300", label: "Under $300" },
  { value: "300-700", label: "$300 – $700" },
  { value: "700-1200", label: "$700 – $1,200" },
  { value: "1200-", label: "Over $1,200" },
] as const;

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export interface ShopFilters {
  availability?: string; // "available" | "sold"
  size?: string;
  price?: string;
  color?: string;
  collection?: string;
  style?: string;
  sort?: string;
}

/** Applies shop filters and sorting in memory (a single artist's catalogue is small). */
export function applyFilters(paintings: Painting[], f: ShopFilters) {
  let list = paintings.filter((p) => {
    if (f.availability === "available" && p.status !== "available") return false;
    if (f.availability === "sold" && p.status === "available") return false;
    if (f.size && sizeBand(p) !== f.size) return false;
    if (f.price) {
      const [min, max] = f.price.split("-").map((n) => (n ? Number(n) : undefined));
      if (min != null && p.price_usd < min) return false;
      if (max != null && p.price_usd >= max) return false;
    }
    if (f.color && !p.colors.includes(f.color)) return false;
    if (f.collection && p.collection !== f.collection) return false;
    if (f.style && p.style !== f.style) return false;
    return true;
  });

  const byDate = (a: Painting, b: Painting) => +new Date(b.created_at) - +new Date(a.created_at);
  switch (f.sort) {
    case "newest":
      list = [...list].sort(byDate);
      break;
    case "price-asc":
      list = [...list].sort((a, b) => a.price_usd - b.price_usd);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.price_usd - a.price_usd);
      break;
    default:
      // Featured: available first, then featured, then the artist's order
      list = [...list].sort(
        (a, b) =>
          Number(a.status !== "available") - Number(b.status !== "available") ||
          Number(b.featured) - Number(a.featured) ||
          a.sort_order - b.sort_order,
      );
  }
  return list;
}

/** Swatch colours for the colour filter chips. */
export const COLOR_SWATCHES: Record<string, string> = {
  black: "#1f1d1b",
  blue: "#2f6fb0",
  coral: "#e8664f",
  earth: "#a0703f",
  gold: "#d4af37",
  green: "#4f8a4f",
  pink: "#e8a0b4",
  purple: "#8e7cc3",
  red: "#c0392b",
  teal: "#1f8a87",
  white: "#f4f1ea",
  yellow: "#e9b93b",
};
