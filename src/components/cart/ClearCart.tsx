"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Empties the cart once an order has been placed (rendered on the confirmation page). */
export function ClearCart({ ids }: { ids?: string[] }) {
  const { ready, items, replace, clear } = useCart();
  useEffect(() => {
    if (!ready) return;
    if (ids?.length) replace(items.filter((i) => !ids.includes(i.id)));
    else clear();
    // run once when the cart has loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return null;
}
