import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { getInstagramPosts } from "@/lib/instagram";
import type { Painting } from "@/lib/types";
import { InstagramIcon } from "./icons";

/**
 * Latest Instagram posts. If no Instagram token is configured (or the API is
 * down), it shows a grid of the gallery's own paintings linking to the profile.
 */
export async function InstagramFeed({ fallback }: { fallback: Painting[] }) {
  const posts = await getInstagramPosts(6);
  const tiles =
    posts.length > 0
      ? posts.map((p) => ({ key: p.id, src: p.imageUrl, alt: p.caption.slice(0, 120) || "Instagram post by Farah in Color", href: p.permalink }))
      : fallback.slice(0, 6).map((p) => ({ key: p.id, src: p.images[0]?.url ?? "", alt: p.images[0]?.alt ?? p.title, href: siteConfig.instagram.url }));

  return (
    <section className="container-page py-20" aria-labelledby="ig-heading">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">On Instagram</p>
          <h2 id="ig-heading" className="mt-2 text-4xl sm:text-5xl">
            Follow the studio, <span className="text-color-gradient italic">live</span>
          </h2>
          <p className="mt-3 max-w-md text-muted">New paintings, works in progress and behind-the-scenes moments, first on Instagram.</p>
        </div>
        <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <InstagramIcon className="h-4 w-4" /> Follow @{siteConfig.instagram.handle}
        </a>
      </div>
      <ul className="mt-10 grid grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-6">
        {tiles.filter((t) => t.src).map((t) => (
          <li key={t.key}>
            <a href={t.href} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden bg-sand">
              <Image src={t.src} alt={t.alt} fill sizes="(min-width:1024px) 16vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100">
                <InstagramIcon className="h-7 w-7" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
