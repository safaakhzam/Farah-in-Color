// Writes supabase/seed.sql from the sample paintings. Run: node scripts/generate-seed.mjs
import { writeFileSync } from "node:fs";
import { samplePaintings } from "../src/lib/sample-data.ts";

const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const rows = samplePaintings.map((p) =>
  `(${q(p.slug)}, ${q(p.title)}, ${q(p.description)}, ${q(p.medium)}, ${p.width_cm ?? "null"}, ${p.height_cm ?? "null"}, ${p.year ?? "null"}, ${p.price_usd}, ${q(p.status)}, ${p.featured}, ${q(p.collection)}, ${q(p.style)}, ${q(`{${p.colors.join(",")}}`)}, ${q(JSON.stringify(p.images))}::jsonb, ${p.sort_order})`,
);
const sql = `-- Optional: sample paintings so the shop is not empty on day one.
-- Run AFTER schema.sql. Delete them later from the admin dashboard.
insert into public.paintings (slug, title, description, medium, width_cm, height_cm, year, price_usd, status, featured, collection, style, colors, images, sort_order)
values
${rows.join(",\n")}
on conflict (slug) do nothing;
`;
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("supabase/seed.sql written");
