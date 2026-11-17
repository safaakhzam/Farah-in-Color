"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/** What the cart remembers about a painting (prices are re-checked on the server at checkout). */
export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  medium: string;
}

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  has: (id: string) => boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  replace: (items: CartItem[]) => void;
  clear: () => void;
}

const STORAGE_KEY = "fic-cart-v1";
export const MAX_CART_ITEMS = 10;
const CartContext = createContext<CartContextValue | null>(null);

/**
 * The cart lives in the visitor's browser (localStorage), so it survives page
 * reloads without an account. Each painting is unique, so quantity is always 1.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      /* storage unavailable: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  // Keep several open tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(JSON.parse(e.newValue || "[]"));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);
  const add = useCallback(
    (item: CartItem) => setItems((prev) => (prev.some((i) => i.id === item.id) || prev.length >= MAX_CART_ITEMS ? prev : [...prev, item])),
    [],
  );
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const replace = useCallback((next: CartItem[]) => setItems(next), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, ready, has, add, remove, replace, clear }), [items, ready, has, add, remove, replace, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
