import { siteConfig, type SizeBand } from "./config";
import type { Painting } from "./types";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats a number as "$1,250". */
export function formatPrice(amount: number) {
  return usd.format(amount);
}

export function formatDimensions(p: Pick<Painting, "width_cm" | "height_cm">) {
  if (!p.width_cm || !p.height_cm) return "Size to be announced";
  const inch = (cm: number) => (cm / 2.54).toFixed(1).replace(/\.0$/, "");
  return `${p.width_cm} × ${p.height_cm} cm (${inch(p.width_cm)} × ${inch(p.height_cm)} in)`;
}

/** Small / Medium / Large based on the longest side of the canvas. */
export function sizeBand(p: Pick<Painting, "width_cm" | "height_cm">): SizeBand {
  if (!p.width_cm || !p.height_cm) return "unknown";
  const longest = Math.max(p.width_cm, p.height_cm);
  if (longest < siteConfig.sizeBands.smallMax) return "small";
  if (longest <= siteConfig.sizeBands.mediumMax) return "medium";
  return "large";
}

export const sizeBandLabels: Record<SizeBand, string> = {
  small: `Small (under ${siteConfig.sizeBands.smallMax} cm)`,
  medium: `Medium (${siteConfig.sizeBands.smallMax}–${siteConfig.sizeBands.mediumMax} cm)`,
  large: `Large (over ${siteConfig.sizeBands.mediumMax} cm)`,
  unknown: "Size to be announced",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
