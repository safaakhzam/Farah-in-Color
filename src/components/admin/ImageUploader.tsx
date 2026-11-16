"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { resizeImage } from "@/lib/image-resize";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PaintingImage } from "@/lib/types";

/**
 * Uploads photos straight from the phone/computer to Supabase Storage.
 * Photos are resized in the browser first (max 2400 px, WebP) so the site stays fast.
 * The first photo is the main one shown in the shop.
 */
export function ImageUploader({
  images,
  onChange,
  title,
  demo,
}: {
  images: PaintingImage[];
  onChange: (imgs: PaintingImage[]) => void;
  title: string;
  demo: boolean;
}) {
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: File[]) {
    if (demo) {
      setError("Demo mode: uploads work once Supabase is connected.");
      return;
    }
    setError(null);
    setUploading(files.length);
    const supabase = createSupabaseBrowserClient();
    const added: PaintingImage[] = [];
    for (const file of files) {
      try {
        const small = await resizeImage(file, 2400, "image/webp", 0.86);
        const ext = small.type === "image/webp" ? "webp" : (small.name.split(".").pop() ?? "jpg");
        const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("paintings").upload(path, small, {
          contentType: small.type,
          cacheControl: "31536000",
        });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("paintings").getPublicUrl(path);
        added.push({ url: data.publicUrl, path, alt: "" });
      } catch (e) {
        setError(`Could not upload ${file.name}: ${(e as Error).message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onChange([...images, ...added]);
  }

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {images.length > 0 && (
        <ul className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <li key={img.url} className="rounded-xl border border-line bg-canvas p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">
                <Image src={img.url} alt={img.alt || title} fill sizes="200px" className="object-contain" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-white">Main photo</span>}
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="absolute right-2 top-2 rounded-full bg-white/90 p-1" aria-label="Remove photo">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                value={img.alt}
                onChange={(e) => onChange(images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                placeholder="Describe the photo (for blind visitors & Google)"
                className="mt-2 w-full rounded-lg border border-line bg-paper px-2 py-1.5 text-xs"
                aria-label={`Description of photo ${i + 1}`}
              />
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 disabled:opacity-30" aria-label="Move left"><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="rounded p-1 disabled:opacity-30" aria-label="Move right"><ArrowRight className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/20 bg-paper px-4 py-10 text-center transition hover:border-teal">
        {uploading > 0 ? <Loader2 className="h-7 w-7 animate-spin text-teal" /> : <ImagePlus className="h-7 w-7 text-teal" />}
        <span className="font-medium">{uploading > 0 ? `Uploading ${uploading} photo(s)…` : "Add photos"}</span>
        <span className="text-xs text-muted">Tap to choose from your phone or computer. You can select several at once.</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={uploading > 0}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) upload(files);
          }}
        />
      </label>
      {error && <p className="field-error">{error}</p>}
      <p className="mt-3 text-xs text-muted">Tip: photograph the painting straight-on in daylight, without flash. Add a close-up of the texture as a second photo.</p>
    </div>
  );
}
