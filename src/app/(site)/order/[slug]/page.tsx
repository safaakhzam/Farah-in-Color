import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderForm } from "@/components/forms/OrderForm";
import { getPaintingBySlug } from "@/lib/data/paintings";
import { getSettings } from "@/lib/data/settings";
import { formatDimensions, formatPrice } from "@/lib/format";
import { deliveryFeeFor } from "@/lib/shipping";

export const metadata: Metadata = { title: "Order", robots: { index: false } };
export const dynamic = "force-dynamic"; // always show live availability

export default async function OrderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [painting, settings] = await Promise.all([getPaintingBySlug(slug), getSettings()]);
  if (!painting) notFound();

  if (painting.status !== "available") {
    return (
      <div className="container-page max-w-xl py-24 text-center">
        <h1 className="text-4xl">This painting is no longer available</h1>
        <p className="mt-4 text-muted">“{painting.title}” has been reserved or sold. Take a look at the other works in the gallery.</p>
        <Link href="/shop" className="btn-primary mt-8">Back to the gallery</Link>
      </div>
    );
  }

  const fee = deliveryFeeFor(painting.price_usd, settings);
  const total = painting.price_usd + fee;
  const img = painting.images[0];

  return (
    <div className="container-page pb-10 pt-6 md:pt-10">
      <Link href={`/paintings/${painting.slug}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronLeft className="h-4 w-4" /> Back to painting
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">Your order</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <aside className="lg:order-2 lg:col-span-5">
          <div className="card p-5 lg:sticky lg:top-28">
            <div className="flex gap-4">
              {img && (
                <div className="relative h-24 w-24 shrink-0 bg-sand">
                  <Image src={img.url} alt={img.alt} fill sizes="96px" className="object-contain p-1" />
                </div>
              )}
              <div>
                <p className="font-serif text-xl">{painting.title}</p>
                <p className="text-sm text-muted">{painting.medium}</p>
                <p className="text-sm text-muted">{formatDimensions(painting)}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Painting</dt><dd>{formatPrice(painting.price_usd)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery (Lebanon)</dt><dd>{fee === 0 ? "Free" : formatPrice(fee)}</dd></div>
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total, cash on delivery</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
          </div>
        </aside>
        <div className="lg:order-1 lg:col-span-7">
          <OrderForm paintingId={painting.id} totalLabel={formatPrice(total)} />
        </div>
      </div>
    </div>
  );
}
