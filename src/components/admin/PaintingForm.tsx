"use client";

import { useActionState, useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deletePainting, savePainting } from "@/actions/admin";
import { Field, FormError } from "@/components/forms/Field";
import { COLOR_SWATCHES } from "@/lib/filters";
import type { Painting, PaintingImage } from "@/lib/types";
import type { FormState } from "@/lib/validation";
import { ImageUploader } from "./ImageUploader";

const MEDIUMS = ["Acrylic on canvas", "Oil on canvas", "Mixed media on canvas", "Watercolor on paper", "Acrylic on wood"];

interface Props {
  painting?: Painting;
  facets: { collections: string[]; styles: string[]; colors: string[] };
  demo: boolean;
}

/** Add / edit a painting. Designed to be simple: every field is labelled in plain words. */
export function PaintingForm({ painting, facets, demo }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePainting, {});
  const [images, setImages] = useState<PaintingImage[]>(painting?.images ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const v = (k: keyof Painting) => {
    const val = painting?.[k];
    return val == null ? "" : String(val);
  };
  const colorOptions = [...new Set([...Object.keys(COLOR_SWATCHES), ...facets.colors])].sort();
  const selected = new Set(painting?.colors ?? []);

  return (
    <form action={action} className="space-y-8" noValidate>
      <input type="hidden" name="id" value={painting?.id ?? ""} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <section className="card space-y-5 p-5 sm:p-8">
        <h2 className="text-2xl">Photos</h2>
        <ImageUploader images={images} onChange={setImages} title={painting?.title ?? ""} demo={demo} />
      </section>

      <section className="card space-y-5 p-5 sm:p-8">
        <h2 className="text-2xl">Details</h2>
        <Field name="title" label="Title" state={state} defaultValue={v("title")} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="price_usd" label="Price (USD $)" type="number" inputMode="decimal" min={0} step="1" state={state} defaultValue={v("price_usd")} required />
          <Field as="select" name="status" label="Status" state={state} defaultValue={v("status") || "available"}>
            <option value="available">Available: can be ordered</option>
            <option value="reserved">Reserved: someone ordered it</option>
            <option value="sold">Sold</option>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="width_cm" label="Width (cm)" type="number" inputMode="decimal" min={0} step="0.5" state={state} defaultValue={v("width_cm")} optional hint="Leave empty if not known yet" />
          <Field name="height_cm" label="Height (cm)" type="number" inputMode="decimal" min={0} step="0.5" state={state} defaultValue={v("height_cm")} optional />
          <Field name="year" label="Year" type="number" inputMode="numeric" state={state} defaultValue={v("year") || String(new Date().getFullYear())} optional />
        </div>
        <Field name="medium" label="Medium" state={state} defaultValue={v("medium") || MEDIUMS[0]} list="mediums" required hint="Pick from the list or type your own" />
        <datalist id="mediums">{MEDIUMS.map((m) => <option key={m} value={m} />)}</datalist>
        <Field as="textarea" name="description" label="Description" state={state} defaultValue={v("description")} placeholder="What inspired it, the mood, the technique…" />
      </section>

      <section className="card space-y-5 p-5 sm:p-8">
        <h2 className="text-2xl">Filters on the shop page</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="collection" label="Collection" state={state} defaultValue={v("collection")} list="collections" optional hint="e.g. Mediterranean Light" />
          <Field name="style" label="Style" state={state} defaultValue={v("style")} list="styles" optional hint="e.g. Abstract, Floral, Landscape" />
        </div>
        <datalist id="collections">{facets.collections.map((c) => <option key={c} value={c} />)}</datalist>
        <datalist id="styles">{[...new Set([...facets.styles, "Abstract", "Floral", "Landscape", "Figurative", "Still life"])].map((s) => <option key={s} value={s} />)}</datalist>
        <fieldset>
          <legend className="field-label">Main colors</legend>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="checkbox" name="colors" value={c} defaultChecked={selected.has(c)} className="peer sr-only" />
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm capitalize transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-teal">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: COLOR_SWATCHES[c] ?? "#ccc" }} />
                  {c}
                </span>
              </label>
            ))}
          </div>
          <input name="extra_colors" placeholder="Other colors, separated by commas" className="field mt-3 text-sm" />
        </fieldset>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={painting?.featured} className="h-5 w-5 accent-[#1f1d1b]" />
          <span><b>Feature on the home page</b> (the first available featured painting becomes the big hero image)</span>
        </label>
        <Field name="sort_order" label="Display order" type="number" state={state} defaultValue={v("sort_order") || "0"} hint="Lower numbers show first. Leave 0 if unsure." className="max-w-48" />
        <Field name="slug" label="Web address" state={state} defaultValue={v("slug")} optional hint="Created from the title automatically. Only change if you know why." />
      </section>

      <FormError state={state} />
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-[#f6f3ee]/95 px-4 py-4 backdrop-blur md:mx-0 md:rounded-2xl md:border">
        <button type="submit" className="btn-primary min-w-40" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save painting
        </button>
        {painting && (
          <div className="flex items-center gap-2">
            {deleteError && <span className="text-sm text-coral-deep">{deleteError}</span>}
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!confirmDelete) return setConfirmDelete(true);
                startDelete(async () => {
                  const res = await deletePainting(painting.id);
                  if (res?.error) setDeleteError(res.error);
                });
              }}
              onBlur={() => setConfirmDelete(false)}
              className={`btn px-4 py-2 ${confirmDelete ? "bg-coral-deep text-white" : "text-coral-deep hover:bg-coral/10"}`}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {confirmDelete ? "Click again to delete forever" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
