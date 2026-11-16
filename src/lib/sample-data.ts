/**
 * Placeholder paintings shown in DEMO MODE (when Supabase is not connected)
 * and used by `supabase/seed.sql`. Replace them with real works from the
 * admin dashboard.
 */
import type { Painting } from "./types";

type Seed = Omit<Painting, "id" | "images" | "created_at" | "sort_order"> & { palette: string[] };

const seeds: Seed[] = [
  { slug: "saffron-tide", title: "Saffron Tide", medium: "Acrylic on canvas", width_cm: 100, height_cm: 70, year: 2025, price_usd: 850, status: "available", featured: true, collection: "Mediterranean Light", style: "Abstract", colors: ["yellow", "blue", "coral"], description: "Late afternoon on the Corniche, when the sea turns gold and the light seems to melt into the water. Layered acrylic with palette-knife textures you can feel.", palette: ["#E9A93B", "#1F6F8B", "#E8664F", "#F6E7C8", "#0E3B4D"] },
  { slug: "coral-bloom", title: "Coral Bloom", medium: "Acrylic on canvas", width_cm: 60, height_cm: 60, year: 2025, price_usd: 520, status: "available", featured: true, collection: "Bloom", style: "Floral", colors: ["coral", "pink", "green"], description: "An explosion of petals in coral and blush, painted in loose, joyful strokes. A piece that brings warmth to any wall.", palette: ["#E8664F", "#F2A7A0", "#2F6B4F", "#FBE3D6", "#B23A48"] },
  { slug: "cedar-morning", title: "Cedar Morning", medium: "Oil on canvas", width_cm: 120, height_cm: 80, year: 2024, price_usd: 1200, status: "reserved", featured: true, collection: "Mediterranean Light", style: "Landscape", colors: ["green", "blue", "earth"], description: "Mist lifting over the cedars at dawn. Soft greens and blues meet warm earth tones in this large, calm landscape.", palette: ["#2F6B4F", "#8DB3A3", "#C9A27E", "#E9EEF0", "#1B3B36"] },
  { slug: "teal-whisper", title: "Teal Whisper", medium: "Acrylic on canvas", width_cm: 30, height_cm: 40, year: 2025, price_usd: 240, status: "available", featured: false, collection: "Abstract Rhythms", style: "Abstract", colors: ["teal", "gold"], description: "A small, quiet piece of deep teal crossed with fine lines of gold leaf. Perfect for a desk, shelf or gallery wall.", palette: ["#1F8A87", "#0F4C4A", "#D4AF37", "#E6F2F1", "#5FB3AE"] },
  { slug: "jasmine-afternoon", title: "Jasmine Afternoon", medium: "Acrylic on canvas", width_cm: 50, height_cm: 70, year: 2024, price_usd: 430, status: "sold", featured: false, collection: "Bloom", style: "Floral", colors: ["white", "green", "yellow"], description: "Jasmine climbing an old stone wall, painted from memories of summer afternoons in the mountains.", palette: ["#F7F3EA", "#6E9E6A", "#E9C46A", "#3E5C3A", "#D8CFC0"] },
  { slug: "rhythm-in-red", title: "Rhythm in Red", medium: "Mixed media on canvas", width_cm: 90, height_cm: 90, year: 2025, price_usd: 950, status: "available", featured: true, collection: "Abstract Rhythms", style: "Abstract", colors: ["red", "coral", "black"], description: "Bold gestures of red and coral dance across a charcoal ground. Energetic and confident: a statement piece for a living room.", palette: ["#C0392B", "#E8664F", "#1F1D1B", "#F4D9CF", "#7A1F1F"] },
  { slug: "byblos-blue", title: "Byblos Blue", medium: "Oil on canvas", width_cm: 70, height_cm: 50, year: 2023, price_usd: 610, status: "available", featured: false, collection: "Mediterranean Light", style: "Landscape", colors: ["blue", "white"], description: "The old harbour of Byblos in a hundred shades of blue, with whitewashed light bouncing off the water.", palette: ["#1D4E89", "#4A90C2", "#F4F7FA", "#A9CCE3", "#0B2545"] },
  { slug: "golden-hour-figure", title: "Golden Hour", medium: "Acrylic on canvas", width_cm: 40, height_cm: 50, year: 2025, price_usd: 380, status: "available", featured: false, collection: "Abstract Rhythms", style: "Figurative", colors: ["yellow", "earth", "coral"], description: "A woman's silhouette dissolving into the warm light of sunset. Simple shapes, warm feeling.", palette: ["#E9A93B", "#B5651D", "#E8664F", "#FFF1D6", "#5C3D2E"] },
  { slug: "pomegranate-season", title: "Pomegranate Season", medium: "Acrylic on canvas", width_cm: 80, height_cm: 60, year: 2024, price_usd: 690, status: "available", featured: false, collection: "Bloom", style: "Still life", colors: ["red", "pink", "green"], description: "Ripe pomegranates spilling their jewels across a linen cloth. A celebration of autumn colour.", palette: ["#9B2335", "#E07A8B", "#4F7942", "#F5EBDD", "#5B1A28"] },
  { slug: "lavender-dusk", title: "Lavender Dusk", medium: "Acrylic on canvas", width_cm: null, height_cm: null, year: 2025, price_usd: 450, status: "available", featured: false, collection: "Abstract Rhythms", style: "Abstract", colors: ["purple", "pink", "blue"], description: "Soft violet and rose blending into twilight blue. Dreamy, calm and meditative.", palette: ["#8E7CC3", "#E3B5C8", "#5B6FA8", "#F3EEF7", "#3B3366"] },
  { slug: "olive-grove", title: "Olive Grove", medium: "Oil on canvas", width_cm: 150, height_cm: 100, year: 2024, price_usd: 1650, status: "available", featured: false, collection: "Mediterranean Light", style: "Landscape", colors: ["green", "earth", "yellow"], description: "Silver-green olive trees on a terraced hillside, painted large so you can almost walk into it.", palette: ["#6B8E23", "#A3B18A", "#C8A165", "#F1EAD7", "#3A5A40"] },
  { slug: "little-sun", title: "Little Sun", medium: "Acrylic on canvas", width_cm: 25, height_cm: 25, year: 2025, price_usd: 150, status: "sold", featured: false, collection: "Bloom", style: "Abstract", colors: ["yellow", "coral"], description: "A tiny burst of sunshine. A perfect first original or a gift.", palette: ["#F4C430", "#E8664F", "#FFF6DC", "#E9A93B", "#C2452D"] },
];

export const samplePalettes: Record<string, string[]> = Object.fromEntries(
  seeds.map((s) => [s.slug, s.palette]),
);

export const samplePaintings: Painting[] = seeds.map(({ palette: _palette, ...s }, i) => ({
  ...s,
  id: `sample-${i + 1}`,
  sort_order: i,
  created_at: new Date(Date.UTC(2025, 10, 1) - i * 86400000 * 9).toISOString(),
  images: [
    { url: `/samples/${s.slug}.jpg`, alt: `${s.title}, ${s.medium.toLowerCase()} by Farah in Color` },
    { url: `/samples/${s.slug}-detail.jpg`, alt: `Close-up detail of the brushwork in ${s.title}` },
  ],
}));
