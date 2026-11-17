"use client";

import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { MAX_CART_ITEMS, useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({ item }: { item: CartItem }) {
  const { has, add, items, ready } = useCart();
  const inCart = ready && has(item.id);

  if (inCart) {
    return (
      <Link href="/cart" className="btn-outline w-full border-teal text-teal-deep">
        <Check className="h-4 w-4" /> In your cart · View cart
      </Link>
    );
  }
  const full = items.length >= MAX_CART_ITEMS;
  return (
    <button type="button" onClick={() => add(item)} disabled={!ready || full} className="btn-outline w-full">
      <ShoppingBag className="h-4 w-4" /> {full ? `Cart is full (${MAX_CART_ITEMS} max)` : "Add to cart"}
    </button>
  );
}
