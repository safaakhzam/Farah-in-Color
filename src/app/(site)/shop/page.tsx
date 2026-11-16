import type { Metadata } from "next";
import { Suspense } from "react";
import { PaintingCard } from "@/components/PaintingCard";
import { ShopFiltersBar } from "@/components/ShopFilters";
import { facetsOf, getPaintings } from "@/lib/data/paintings";
import { applyFilters, type ShopFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop original paintings",
  description: "Browse original canvas paintings by Farah in Color. Filter by size, price, color and collection. Cash on delivery across Lebanon.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const all = await getPaintings();
  const facets = facetsOf(all);
  const filters: ShopFilters = {
    availability: sp.availability,
    size: sp.size,
    price: sp.price,
    color: sp.color,
    collection: sp.collection,
    style: sp.style,
    sort: sp.sort,
  };
  const paintings = applyFilters(all, filters);

  return (
    <div className="container-page pb-10 pt-10 md:pt-16">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">The gallery</p>
        <h1 className="mt-3 text-5xl sm:text-6xl">
          Original <span className="text-color-gradient italic">paintings</span>
        </h1>
        <p className="mt-4 text-lg text-muted">Each piece is unique and painted by hand. Delivered across Lebanon, cash on delivery.</p>
      </header>

      <Suspense>
        <ShopFiltersBar collections={facets.collections} styles={facets.styles} colors={facets.colors} total={paintings.length} />
      </Suspense>

      {paintings.length === 0 ? (
        <p className="py-24 text-center text-muted">No paintings match these filters. Try removing one.</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {paintings.map((p, i) => (
            <PaintingCard key={p.id} painting={p} priority={i < 2} variant="framed" />
          ))}
        </div>
      )}
    </div>
  );
}
