"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { COLOR_SWATCHES, PRICE_RANGES, SORTS } from "@/lib/filters";
import { sizeBandLabels } from "@/lib/format";

interface Props {
  collections: string[];
  styles: string[];
  colors: string[];
  total: number;
}

export function ShopFiltersBar({ collections, styles, colors, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const get = (k: string) => params.get(k) ?? "";
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params.toString());
    if (v) next.set(k, v);
    else next.delete(k);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const activeCount = ["availability", "size", "price", "color", "collection", "style"].filter((k) => params.get(k)).length;
  const clear = () => startTransition(() => router.replace(get("sort") ? `${pathname}?sort=${get("sort")}` : pathname, { scroll: false }));

  const select = (k: string, label: string, options: { value: string; label: string }[]) => (
    <label className="block">
      <span className="eyebrow mb-2 block">{label}</span>
      <select value={get(k)} onChange={(e) => set(k, e.target.value)} className="field py-2.5 text-sm">
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className={pending ? "opacity-70 transition" : "transition"}>
      <div className="flex items-center justify-between gap-4 border-y border-line py-3">
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-2 text-sm font-medium" aria-expanded={open} aria-controls="filters-panel">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeCount > 0 && <span className="rounded-full bg-coral-deep px-2 py-0.5 text-xs text-white">{activeCount}</span>}
        </button>
        <p className="hidden text-sm text-muted sm:block" aria-live="polite">
          {total} {total === 1 ? "painting" : "paintings"}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort</span>
          <select value={get("sort") || "featured"} onChange={(e) => set("sort", e.target.value === "featured" ? "" : e.target.value)} className="bg-transparent font-medium focus:outline-none">
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div id="filters-panel" className="animate-fade-up border-b border-line py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {select("availability", "Availability", [
              { value: "available", label: "Available" },
              { value: "sold", label: "Sold / reserved" },
            ])}
            {select("size", "Size", (["small", "medium", "large"] as const).map((v) => ({ value: v, label: sizeBandLabels[v] })))}
            {select("price", "Price", PRICE_RANGES.map((r) => ({ value: r.value, label: r.label })))}
            {select("collection", "Collection", collections.map((c) => ({ value: c, label: c })))}
            {select("style", "Style", styles.map((s) => ({ value: s, label: s })))}
          </div>
          <fieldset className="mt-6">
            <legend className="eyebrow mb-3">Color</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => {
                const active = get("color") === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", active ? "" : c)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm capitalize transition ${active ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink/40"}`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: COLOR_SWATCHES[c] ?? "#ccc" }} aria-hidden />
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>
          {activeCount > 0 && (
            <button type="button" onClick={clear} className="mt-6 inline-flex items-center gap-1 text-sm text-coral-deep">
              <X className="h-4 w-4" /> Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
