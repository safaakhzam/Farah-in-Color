import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, ChevronRight, Truck } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { WhatsAppIcon } from "@/components/icons";
import { PaintingCard } from "@/components/PaintingCard";
import { PaintingGallery } from "@/components/PaintingGallery";
import { StatusBadge } from "@/components/StatusBadge";
import { siteConfig } from "@/lib/config";
import { getPaintingBySlug, getPaintings } from "@/lib/data/paintings";
import { getSettings } from "@/lib/data/settings";
import { formatDimensions, formatPrice } from "@/lib/format";
import { deliveryFeeFor } from "@/lib/shipping";
import { whatsappLink } from "@/lib/whatsapp";

export const revalidate = 300;

export async function generateStaticParams() {
  const paintings = await getPaintings();
  return paintings.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPaintingBySlug(slug);
  if (!p) return { title: "Painting not found" };
  const title = `${p.title}, original ${p.medium.toLowerCase()}`;
  const description = `${p.description.slice(0, 150)} ${p.status === "available" ? formatPrice(p.price_usd) : "Sold"} · Cash on delivery in Lebanon.`;
  const image = p.images[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: `/paintings/${p.slug}` },
    openGraph: { title: `${p.title} | ${siteConfig.name}`, description, url: `/paintings/${p.slug}`, images: image ? [{ url: image, alt: p.images[0].alt }] : undefined },
  };
}

export default async function PaintingPage({ params }: Props) {
  const { slug } = await params;
  const [painting, all, settings] = await Promise.all([getPaintingBySlug(slug), getPaintings(), getSettings()]);
  if (!painting) notFound();

  const available = painting.status === "available";
  const fee = deliveryFeeFor(painting.price_usd, settings);
  const wa = whatsappLink(settings.whatsapp_number, `Hello Farah! I'm interested in "${painting.title}" (${siteConfig.url}/paintings/${painting.slug}).`);
  const related = all
    .filter((p) => p.id !== painting.id && p.status === "available")
    .sort((a, b) => Number(b.collection === painting.collection) - Number(a.collection === painting.collection))
    .slice(0, 3);

  // Structured data so Google can show price & availability
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "VisualArtwork"],
    name: painting.title,
    description: painting.description,
    image: painting.images.map((i) => (i.url.startsWith("http") ? i.url : `${siteConfig.url}${i.url}`)),
    artform: "Painting",
    artMedium: painting.medium,
    ...(painting.width_cm && { width: { "@type": "Distance", name: `${painting.width_cm} cm` } }),
    ...(painting.height_cm && { height: { "@type": "Distance", name: `${painting.height_cm} cm` } }),
    creator: { "@type": "Person", name: "Farah" },
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      price: painting.price_usd,
      priceCurrency: "USD",
      availability: available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      itemCondition: "https://schema.org/NewCondition",
      url: `${siteConfig.url}/paintings/${painting.slug}`,
      areaServed: "LB",
    },
  };

  const details: [string, string | null][] = [
    ["Dimensions", formatDimensions(painting)],
    ["Medium", painting.medium],
    ["Year", painting.year ? String(painting.year) : null],
    ["Collection", painting.collection],
    ["Style", painting.style],
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-page pb-10 pt-6 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted">
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-ink" aria-current="page">{painting.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <PaintingGallery painting={painting} />
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-center gap-3">
              <StatusBadge status={painting.status} />
              <span className="eyebrow">Original · one of a kind</span>
            </div>
            <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{painting.title}</h1>
            <p className={`mt-3 text-2xl ${available ? "" : "text-muted"}`}>
              {painting.status === "sold" ? "Sold" : formatPrice(painting.price_usd)}
            </p>

            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {details.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink/85">{painting.description}</p>

            <div className="mt-8 space-y-3">
              {available ? (
                <Link href={`/order/${painting.slug}`} className="btn-primary w-full py-4 text-base">
                  <Banknote className="h-5 w-5" /> Order (Cash on Delivery)
                </Link>
              ) : (
                <p className="rounded-xl bg-sand px-4 py-3 text-sm">
                  {painting.status === "reserved"
                    ? "This painting is reserved for a buyer. Ask Farah to be told if it becomes available again."
                    : "This painting has found its home. Farah can paint something similar for you as a commission."}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <a href="#inquire" className="btn-outline w-full">Inquire about this piece</a>
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full">
                    <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
                  </a>
                ) : (
                  !available && <Link href="/commissions" className="btn-outline w-full">Request a commission</Link>
                )}
              </div>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <Truck className="h-5 w-5 shrink-0 text-teal" />
                Hand-delivered by Farah anywhere in Lebanon. Delivery: {fee === 0 ? "free" : formatPrice(fee)}.
              </li>
              <li className="flex gap-3">
                <Banknote className="h-5 w-5 shrink-0 text-teal" />
                No online payment. Pay cash (USD) when you receive your painting.
              </li>
            </ul>
          </div>
        </div>

        <section id="inquire" className="mx-auto mt-20 max-w-2xl scroll-mt-28">
          <h2 className="text-3xl">Inquire about “{painting.title}”</h2>
          <p className="mt-2 text-muted">Questions about size, framing or delivery? Farah will reply personally.</p>
          <div className="mt-6">
            <ContactForm painting={painting.title} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-24" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-3xl">You may also love</h2>
            <div className="mt-8 grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PaintingCard key={p.id} painting={p} variant="framed" />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
