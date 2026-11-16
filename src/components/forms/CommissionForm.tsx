"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { submitCommission } from "@/actions/forms";
import { resizeImage } from "@/lib/image-resize";
import type { FormState } from "@/lib/validation";
import { Field, FormError, Honeypot } from "./Field";

const MAX_FILES = 5;

export function CommissionForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, fd) => {
    // Replace the raw file input with compressed images to keep uploads fast on mobile data.
    fd.delete("references");
    const small = await Promise.all(files.map((f) => resizeImage(f)));
    small.forEach((f) => fd.append("references", f));
    return submitCommission(prev, fd);
  }, {});

  if (state.ok) {
    return (
      <div className="card flex items-start gap-3 p-8" role="status">
        <CheckCircle2 className="h-7 w-7 shrink-0 text-teal" />
        <div>
          <p className="font-serif text-2xl">Thank you!</p>
          <p className="mt-2 text-muted">
            Your commission request has been sent. Farah will get back to you within a few days to talk about your idea.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Your name" state={state} autoComplete="name" required />
        <Field name="email" label="Email" type="email" state={state} autoComplete="email" required />
        <Field name="phone" label="Phone / WhatsApp" type="tel" state={state} autoComplete="tel" optional />
        <Field name="budget" label="Budget (USD)" type="number" inputMode="numeric" min={0} step={10} placeholder="e.g. 500" state={state} optional />
      </div>
      <Field name="size" label="Size" state={state} placeholder="e.g. 60 × 80 cm, or “large, for above my sofa”" required />
      <Field name="colors" label="Colors you love" state={state} placeholder="e.g. warm terracotta, olive green, a touch of gold" optional />
      <Field as="textarea" name="description" label="Tell Farah about your idea" state={state} placeholder="The room it's for, the mood, a memory or place to capture…" required />

      <div>
        <p className="field-label">
          Reference images <span className="font-normal text-muted">(optional, up to {MAX_FILES})</span>
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 bg-paper px-4 py-8 text-center text-sm text-muted transition hover:border-teal">
          <ImagePlus className="h-6 w-6 text-teal" />
          <span>Tap to add photos of your room, colors or inspiration</span>
          <input
            type="file"
            name="references"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              setFiles((prev) => [...prev, ...picked].slice(0, MAX_FILES));
              e.target.value = "";
            }}
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <li key={f.name + i} className="relative h-20 w-20 overflow-hidden rounded-lg bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt={`Reference ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5"
                  aria-label={`Remove reference ${i + 1}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <FormError state={state} />
      <button type="submit" className="btn-accent w-full sm:w-auto" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Send commission request
      </button>
    </form>
  );
}
