import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { artistGreeting, artistStory } from "@/content/artist";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About the artist",
  description: "Meet Farah, the Lebanese actress and artist behind Farah in Color, and the story behind her paintings.",
  alternates: { canonical: "/about" },
};

/* Farah's story lives in src/content/artist.ts (shared with the home page).
 * Her photo is /public/images/farah.jpg (portrait 3:4, 1200 × 1600 px): replace the file to change it. */

export default function AboutPage() {
  return (
    <div className="pb-10">
      <section className="container-page grid items-center gap-12 pt-10 md:grid-cols-2 md:pt-16">
        <div className="relative">
          <Image
            src="/images/farah.jpg"
            alt="Farah, the artist behind Farah in Color, holding her paintbrushes in her studio"
            width={1200}
            height={1600}
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="h-auto w-full"
          />
          <div className="bg-color-gradient absolute -bottom-3 left-6 h-1.5 w-2/3" aria-hidden />
        </div>
        <div>
          <p className="eyebrow">About the artist</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">
            Where Emotions find their <span className="text-color-gradient italic">Color</span>
          </h1>
          <p className="mt-6 font-serif text-3xl">{artistGreeting}</p>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/85">
            {artistStory.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
            <InstagramIcon className="h-4 w-4" /> Follow my studio on Instagram
          </a>
        </div>
      </section>

      <section className="container-page mt-28">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center text-white sm:px-16">
          <div className="bg-color-gradient absolute inset-x-0 top-0 h-1.5" aria-hidden />
          <h2 className="text-4xl sm:text-5xl">Have something special in mind?</h2>
          <p className="mx-auto mt-4 max-w-lg text-white/75">I love creating custom paintings for your home, office or as a meaningful gift.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/commissions" className="btn bg-white text-ink hover:bg-canvas">Commission a painting</Link>
            <Link href="/shop" className="btn border border-white/30 text-white hover:border-white">Browse the gallery</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
