import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Banknote, Paintbrush, Truck } from "lucide-react";
import { InstagramFeed } from "@/components/InstagramFeed";
import { PaintingCard } from "@/components/PaintingCard";
import { StatusBadge } from "@/components/StatusBadge";
import { getFeaturedPaintings, getPaintings } from "@/lib/data/paintings";
import { formatPrice } from "@/lib/format";

export const revalidate = 300; // refresh at most every 5 minutes (admin changes refresh instantly)

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedPaintings(7), getPaintings()]);
  const hero = featured.find((p) => p.status === "available") ?? featured[0];
  const collection = featured.filter((p) => p.id !== hero?.id).slice(0, 6);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="container-page grid items-center gap-10 pb-16 pt-8 md:grid-cols-12 md:gap-12 md:pb-24 md:pt-16">
        <div className="animate-fade-up md:col-span-5">
          <p className="eyebrow">Original paintings on canvas</p>
          <h1 className="mt-4 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Art that fills a room with <span className="text-color-gradient italic">color</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            One-of-a-kind paintings by Farah, painted by hand and delivered to your door anywhere in Lebanon.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Explore the gallery <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/commissions" className="btn-outline">
              Commission a piece
            </Link>
          </div>
        </div>
        {hero && (
          <figure className="md:col-span-7">
            <Link href={`/paintings/${hero.slug}`} className="group relative block overflow-hidden bg-sand shadow-[0_30px_60px_-30px_rgba(31,29,27,0.45)]">
              <Image
                src={hero.images[0]?.url}
                alt={hero.images[0]?.alt ?? hero.title}
                width={1400}
                height={Math.round(1400 * ((hero.height_cm ?? 5) / (hero.width_cm ?? 4)))}
                priority
                sizes="(min-width: 768px) 58vw, 100vw"
                className="h-auto max-h-[78vh] w-full object-cover transition duration-1000 group-hover:scale-[1.02]"
              />
            </Link>
            <figcaption className="mt-4 flex items-center justify-between text-sm">
              <span>
                <span className="font-serif text-lg italic">{hero.title}</span>
                <span className="text-muted"> · {hero.medium}</span>
              </span>
              {hero.status === "available" ? <span className="font-medium">{formatPrice(hero.price_usd)}</span> : <StatusBadge status={hero.status} />}
            </figcaption>
          </figure>
        )}
      </section>

      {/* ── Artist intro ─────────────────────────────────── */}
      <section className="bg-sand/70">
        <div className="container-page grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16">
          <div className="relative mx-auto w-full max-w-sm md:max-w-none">
            <Image
              src="/images/artist-placeholder.jpg"
              alt="Farah, the artist behind Farah in Color, in her studio"
              width={1000}
              height={1250}
              sizes="(min-width: 768px) 40vw, 90vw"
              className="h-auto w-full md:max-w-md"
            />
            <div className="bg-color-gradient absolute -bottom-3 left-6 right-6 h-1.5 md:right-auto md:w-2/3" aria-hidden />
          </div>
          <div>
            <p className="eyebrow">Meet the artist</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Hello, I&apos;m Farah</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              I&apos;m an art designer who paints on canvas. My work is about light, warmth and the colors of everyday
              life in Lebanon: the sea at golden hour, flowers on a balcony, a feeling I want to hold on to.
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              Every painting is an original, signed and made by hand. Once it finds its home, it&apos;s gone for good.
            </p>
            <Link href="/about" className="mt-8 inline-flex items-center gap-2 border-b border-ink pb-1 text-sm font-medium hover:border-coral hover:text-coral-deep">
              Read my story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured collection ──────────────────────────── */}
      <section className="container-page py-20" aria-labelledby="featured-heading">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Featured collection</p>
            <h2 id="featured-heading" className="mt-2 text-4xl sm:text-5xl">Selected works</h2>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-medium hover:text-coral-deep sm:inline-flex">
            View all {all.length} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 columns-1 gap-8 sm:columns-2 lg:columns-3 [&>*]:mb-10 [&>*]:break-inside-avoid">
          {collection.map((p) => (
            <PaintingCard key={p.id} painting={p} />
          ))}
        </div>
        <Link href="/shop" className="btn-outline mt-4 w-full sm:hidden">
          View all paintings
        </Link>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="border-y border-line">
        <ul className="container-page grid gap-8 py-12 sm:grid-cols-3">
          {[
            { icon: Paintbrush, title: "One of a kind", text: "Every painting is an original. When it's gone, it's gone." },
            { icon: Banknote, title: "Cash on delivery", text: "Nothing to pay online. Pay in USD when your painting arrives." },
            { icon: Truck, title: "Delivered by Farah", text: "Carefully wrapped and hand-delivered anywhere in Lebanon." },
          ].map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${["bg-coral/15 text-coral-deep", "bg-saffron/20 text-[#7a4f00]", "bg-teal/15 text-teal-deep"][i]}`}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-sans text-base font-medium">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Instagram ────────────────────────────────────── */}
      <InstagramFeed fallback={all} />
    </>
  );
}
