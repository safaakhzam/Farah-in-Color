/**
 * Generates the placeholder "paintings" in /public/samples so the design can be
 * previewed before real photos exist. Run with: npm run samples
 * (Requires Node 22.18+ for TypeScript import.)
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { samplePaintings, samplePalettes } from "../src/lib/sample-data.ts";

const out = new URL("../public/samples/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function svgFor(p, W, H) {
  const pal = samplePalettes[p.slug];
  const r = rng(p.slug);
  const pick = () => pal[Math.floor(r() * pal.length)];
  const parts = [];
  const bg = pal[3];
  parts.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);

  if (p.style === "Landscape") {
    // Layered horizon bands with soft edges
    let y = H * 0.25;
    for (let i = 0; i < 7; i++) {
      const c = pal[(i + 1) % pal.length];
      const amp = H * (0.02 + r() * 0.05);
      let d = `M0 ${y}`;
      for (let x = 0; x <= W; x += W / 8) d += ` Q${x + W / 16} ${y - amp + r() * amp * 2} ${x + W / 8} ${y + (r() - 0.5) * amp}`;
      d += ` L${W} ${H} L0 ${H} Z`;
      parts.push(`<path d="${d}" fill="${c}" opacity="${0.75 + r() * 0.25}"/>`);
      y += H * (0.08 + r() * 0.06);
    }
    parts.push(`<circle cx="${W * (0.2 + r() * 0.6)}" cy="${H * 0.18}" r="${W * 0.07}" fill="${pal[2]}" opacity="0.8"/>`);
  } else if (p.style === "Floral" || p.style === "Still life") {
    for (let i = 0; i < 26; i++) {
      const cx = W * (0.1 + r() * 0.8), cy = H * (0.1 + r() * 0.8), rad = Math.min(W, H) * (0.04 + r() * 0.1);
      const c = pick();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 + r();
        parts.push(`<ellipse cx="${cx + Math.cos(a) * rad * 0.7}" cy="${cy + Math.sin(a) * rad * 0.7}" rx="${rad * 0.6}" ry="${rad * 0.35}" transform="rotate(${(a * 180) / Math.PI} ${cx + Math.cos(a) * rad * 0.7} ${cy + Math.sin(a) * rad * 0.7})" fill="${c}" opacity="0.8"/>`);
      }
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad * 0.25}" fill="${pal[0]}"/>`);
    }
  } else if (p.style === "Figurative") {
    parts.push(`<rect width="${W}" height="${H}" fill="${pal[0]}" opacity="0.5"/>`);
    parts.push(`<circle cx="${W * 0.5}" cy="${H * 0.45}" r="${W * 0.38}" fill="${pal[2]}" opacity="0.55"/>`);
    parts.push(`<ellipse cx="${W * 0.5}" cy="${H * 0.33}" rx="${W * 0.08}" ry="${W * 0.1}" fill="${pal[4]}"/>`);
    parts.push(`<path d="M${W * 0.36} ${H} C${W * 0.38} ${H * 0.6} ${W * 0.42} ${H * 0.45} ${W * 0.5} ${H * 0.44} C${W * 0.58} ${H * 0.45} ${W * 0.62} ${H * 0.6} ${W * 0.64} ${H} Z" fill="${pal[4]}"/>`);
  } else {
    // Abstract: big gestural strokes and blocks
    for (let i = 0; i < 18; i++) {
      const x = r() * W, y = r() * H, w = W * (0.2 + r() * 0.5), h = H * (0.03 + r() * 0.12);
      parts.push(`<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${pick()}" opacity="${0.55 + r() * 0.45}" transform="rotate(${-35 + r() * 70} ${x} ${y})"/>`);
    }
    for (let i = 0; i < 6; i++) {
      parts.push(`<circle cx="${r() * W}" cy="${r() * H}" r="${Math.min(W, H) * (0.05 + r() * 0.18)}" fill="${pick()}" opacity="0.6"/>`);
    }
  }
  // Canvas texture: fine noise
  const noise = `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.22 0"/></filter><rect width="${W}" height="${H}" filter="url(#n)"/>`;
  const blur = `<filter id="b"><feGaussianBlur stdDeviation="${W * 0.002}"/></filter>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${blur}</defs><g filter="url(#b)">${parts.join("")}</g>${noise}</svg>`;
}

for (const p of samplePaintings) {
  const w = p.width_cm ?? 40, h = p.height_cm ?? 50;
  const scale = 1600 / Math.max(w, h);
  const W = Math.round(w * scale), H = Math.round(h * scale);
  const svg = Buffer.from(svgFor(p, W, H));
  const img = sharp(svg).flatten({ background: "#ffffff" });
  await img.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(`${out}${p.slug}.jpg`);
  const cw = Math.round(W * 0.45), ch = Math.round(H * 0.45);
  await img.clone().extract({ left: Math.round((W - cw) / 2), top: Math.round((H - ch) / 2), width: cw, height: ch })
    .resize(1200).jpeg({ quality: 82, mozjpeg: true }).toFile(`${out}${p.slug}-detail.jpg`);
  console.log("✓", p.slug);
}

// Artist portrait placeholder
const portrait = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1250"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E7C8"/><stop offset="1" stop-color="#F2C5B6"/></linearGradient></defs><rect width="1000" height="1250" fill="url(#g)"/><circle cx="500" cy="470" r="150" fill="#1F1D1B" opacity="0.85"/><path d="M220 1250 C240 900 360 760 500 760 C640 760 760 900 780 1250Z" fill="#1F1D1B" opacity="0.85"/><rect x="640" y="180" width="260" height="320" fill="#E8664F" opacity="0.8"/><rect x="90" y="620" width="180" height="230" fill="#1F8A87" opacity="0.8"/><rect x="700" y="560" width="160" height="200" fill="#E9A93B" opacity="0.85"/><text x="500" y="1200" font-family="Georgia, serif" font-size="34" text-anchor="middle" fill="#ffffff" opacity="0.9">Artist photo coming soon</text></svg>`;
await sharp(Buffer.from(portrait)).jpeg({ quality: 82 }).toFile(new URL("../public/images/artist-placeholder.jpg", import.meta.url).pathname);

// Default Open Graph share image (1200×630)
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="c" x1="0" x2="1"><stop offset="0" stop-color="#E8664F"/><stop offset="0.5" stop-color="#E9A93B"/><stop offset="1" stop-color="#1F8A87"/></linearGradient></defs><rect width="1200" height="630" fill="#FBF8F3"/><rect x="0" y="600" width="1200" height="30" fill="url(#c)"/><text x="600" y="320" font-family="Georgia, serif" font-size="96" text-anchor="middle" fill="#1F1D1B">Farah in <tspan fill="url(#c)" font-style="italic">Color</tspan></text><text x="600" y="400" font-family="Helvetica, Arial, sans-serif" font-size="30" letter-spacing="6" text-anchor="middle" fill="#6B655E">ORIGINAL PAINTINGS ON CANVAS</text></svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 88 }).toFile(new URL("../public/og-default.jpg", import.meta.url).pathname);
console.log("Done.");
