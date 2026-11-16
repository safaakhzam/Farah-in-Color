import { writeFileSync } from "node:fs";
import { samplePaintings } from "../../src/lib/sample-data.ts";
writeFileSync(new URL("./data.json", import.meta.url), JSON.stringify(samplePaintings.map((p) => ({
  id: p.id, slug: p.slug, title: p.title, medium: p.medium, price: p.price_usd, status: p.status, w: p.width_cm, h: p.height_cm,
  colors: p.colors, collection: p.collection, style: p.style, featured: p.featured, order: p.sort_order, created: p.created_at,
  image: p.images[0].url.replace(/^\//, ""), alt: p.images[0].alt,
}))));
