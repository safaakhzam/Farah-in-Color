import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About the artist",
  description: "Meet Farah, the art designer behind Farah in Color, and discover her story and painting process.",
  alternates: { canonical: "/about" },
};

/*
 * ✏️ PLACEHOLDER TEXT: replace the story and process below with Farah's own words,
 * and replace /public/images/artist-placeholder.jpg with her photo (same file name,
 * portrait orientation, ideally 1000 × 1250 px).
 */
const process = [
  { title: "Inspiration", text: "It starts with a feeling: light on the sea, a market full of color, a quiet morning. I collect photos, sketches and color notes." },
  { title: "Color first", text: "I mix my palette before I paint a single line. Color is the heart of every piece, so I take my time to get it right." },
  { title: "Layers & texture", text: "I build the canvas up in layers of acrylic and oil, using brushes, palette knives and sometimes my hands." },
  { title: "Finishing", text: "Each painting is varnished to protect it, signed on the front, and documented with a certificate of authenticity." },
];

export default function AboutPage() {
  return (
    <div className="pb-10">
      <section className="container-page grid items-center gap-12 pt-10 md:grid-cols-2 md:pt-16">
        <div className="relative">
          <Image
            src="/images/artist-placeholder.jpg"
            alt="Portrait of Farah, the artist behind Farah in Color"
            width={1000}
            height={1250}
            priority
            sizes="(min-width: 768px) 45vw, 100vw"
            className="h-auto w-full"
          />
          <div className="bg-color-gradient absolute -bottom-3 left-6 h-1.5 w-2/3" aria-hidden />
        </div>
        <div>
          <p className="eyebrow">About the artist</p>
          <h1 className="mt-3 text-5xl sm:text-6xl">
            Painting life <span className="text-color-gradient italic">in color</span>
          </h1>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/85">
            <p>
              I&apos;m Farah, an art designer based in Lebanon. For as long as I can remember I&apos;ve been drawn to color:
              the way it changes a room, a mood, a whole day.
            </p>
            <p>
              Farah in Color began as a small corner of my home filled with canvases. Today it&apos;s where I share
              original paintings inspired by the Mediterranean light, flowers, places I love and the emotions they leave behind.
            </p>
            <p>
              Every piece is painted by hand and exists only once. When you bring one home, you&apos;re keeping a moment
              that no one else will own.
            </p>
          </div>
          <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8">
            <InstagramIcon className="h-4 w-4" /> Follow my studio on Instagram
          </a>
        </div>
      </section>

      <section className="container-page mt-28" aria-labelledby="process-heading">
        <p className="eyebrow">The process</p>
        <h2 id="process-heading" className="mt-2 text-4xl sm:text-5xl">From blank canvas to your wall</h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <li key={step.title} className="border-t-2 pt-6" style={{ borderColor: ["#e8664f", "#e9a93b", "#1f8a87", "#1f1d1b"][i] }}>
              <span className="font-serif text-5xl italic text-muted/50">0{i + 1}</span>
              <h3 className="mt-3 font-sans text-lg font-medium">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
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
