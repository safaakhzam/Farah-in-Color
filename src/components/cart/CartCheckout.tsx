"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag, X } from "lucide-react";
import { getCartPaintings } from "@/actions/cart";
import { OrderForm } from "@/components/forms/OrderForm";
import { formatPrice } from "@/lib/format";
import type { PaintingStatus } from "@/lib/types";
import { useCart } from "./CartProvider";

interface Props {
  deliveryFee: number;
  freeShippingThreshold: number | null;
}

/** Cart contents + checkout form on one page (fewer steps on a phone). */
export function CartCheckout({ deliveryFee, freeShippingThreshold }: Props) {
  const { items, ready, remove, replace } = useCart();
  const [statuses, setStatuses] = useState<Record<string, PaintingStatus | "missing">>({});
  const [checking, setChecking] = useState(true);

  // Re-check every painting against the live shop (sold meanwhile? price changed?)
  const idsKey = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!ready) return;
    if (!items.length) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    getCartPaintings(items.map((i) => i.id)).then((live) => {
      if (cancelled) return;
      const map: Record<string, PaintingStatus | "missing"> = {};
      items.forEach((i) => (map[i.id] = "missing"));
      live.forEach((p) => (map[p.id] = p.status));
      setStatuses(map);
      // refresh titles / prices / images from the shop
      const changed = items.some((i) => {
        const l = live.find((p) => p.id === i.id);
        return l && (l.price !== i.price || l.title !== i.title || l.image !== i.image);
      });
      if (changed) {
        replace(items.map((i) => {
          const l = live.find((p) => p.id === i.id);
          return l ? { id: l.id, slug: l.slug, title: l.title, price: l.price, image: l.image, medium: l.medium } : i;
        }));
      }
      setChecking(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, idsKey]);

  if (!ready) return <div className="py-24 text-center text-muted"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted" aria-hidden />
        <h1 className="mt-6 text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Find a painting you love and tap “Add to cart”.</p>
        <Link href="/shop" className="btn-primary mt-8">Explore the gallery</Link>
      </div>
    );
  }

  const unavailable = items.filter((i) => statuses[i.id] && statuses[i.id] !== "available");
  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const fee = freeShippingThreshold != null && subtotal >= freeShippingThreshold ? 0 : deliveryFee;
  const total = subtotal + fee;

  return (
    <>
      <h1 className="text-4xl sm:text-5xl">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <aside className="lg:order-2 lg:col-span-5">
          <div className="card p-5 lg:sticky lg:top-28">
            <ul className="divide-y divide-line">
              {items.map((i) => {
                const st = statuses[i.id];
                const bad = st && st !== "available";
                return (
                  <li key={i.id} className="flex gap-4 py-4 first:pt-0">
                    <Link href={`/paintings/${i.slug}`} className="relative h-20 w-20 shrink-0 bg-sand">
                      {i.image && <Image src={i.image} alt={i.title} fill sizes="80px" className={`object-contain p-1 ${bad ? "opacity-50" : ""}`} />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/paintings/${i.slug}`} className="font-serif text-xl leading-tight">{i.title}</Link>
                      <p className="text-sm text-muted">{i.medium}</p>
                      {bad && (
                        <p className="mt-1 text-sm text-coral-deep">
                          {st === "missing" ? "No longer in the shop" : st === "sold" ? "Sold, please remove it" : "Just reserved by someone else, please remove it"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <span className={`text-sm font-medium ${bad ? "text-muted line-through" : ""}`}>{formatPrice(i.price)}</span>
                      <button type="button" onClick={() => remove(i.id)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-coral-deep" aria-label={`Remove ${i.title} from cart`}>
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">{items.length} {items.length === 1 ? "painting" : "paintings"}</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery (Lebanon)</dt><dd>{fee === 0 ? "Free" : formatPrice(fee)}</dd></div>
              {freeShippingThreshold != null && fee > 0 && (
                <p className="text-xs text-teal-deep">Free delivery from {formatPrice(freeShippingThreshold)}.</p>
              )}
              <div className="flex justify-between border-t border-line pt-3 text-base font-medium"><dt>Total, cash on delivery</dt><dd>{formatPrice(total)}</dd></div>
            </dl>
            <Link href="/shop" className="mt-4 block text-center text-sm underline underline-offset-4 hover:text-coral-deep">Continue shopping</Link>
          </div>
        </aside>

        <div className="lg:order-1 lg:col-span-7">
          <h2 className="mb-6 text-3xl">Delivery details</h2>
          {checking ? (
            <p className="flex items-center gap-2 text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Checking availability…</p>
          ) : unavailable.length > 0 ? (
            <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral-deep">
              Some paintings in your cart are no longer available. Remove them to continue.
            </p>
          ) : (
            <OrderForm paintingIds={items.map((i) => i.id)} totalLabel={formatPrice(total)} />
          )}
        </div>
      </div>
    </>
  );
}
