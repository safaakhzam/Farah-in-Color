import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getPaintings } from "@/lib/data/paintings";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paintings = await getPaintings();
  const base = siteConfig.url;
  const pages = ["", "/shop", "/about", "/commissions", "/contact"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));
  return [
    ...pages,
    ...paintings.map((p) => ({
      url: `${base}/paintings/${p.slug}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "monthly" as const,
      priority: p.status === "available" ? 0.7 : 0.4,
      images: p.images.map((i) => (i.url.startsWith("http") ? i.url : `${base}${i.url}`)),
    })),
  ];
}
