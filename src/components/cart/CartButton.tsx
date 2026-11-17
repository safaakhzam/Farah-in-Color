"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

/** Bag icon with the number of paintings in the cart (header). */
export function CartButton({ className = "" }: { className?: string }) {
  const { items, ready } = useCart();
  const count = ready ? items.length : 0;
  return (
    <Link href="/cart" className={`relative inline-flex p-2 ${className}`} aria-label={`Cart, ${count} ${count === 1 ? "painting" : "paintings"}`}>
      <ShoppingBag className="h-6 w-6 md:h-5 md:w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-deep px-1 text-[11px] font-medium text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
