"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { placeOrder } from "@/actions/orders";
import { LEBANON_AREAS } from "@/lib/lebanon";
import type { FormState } from "@/lib/validation";
import { Field, FormError, Honeypot } from "./Field";

export function OrderForm({ paintingId, totalLabel }: { paintingId: string; totalLabel: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(placeOrder, {});

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <Honeypot />
      <input type="hidden" name="paintingId" value={paintingId} />
      <Field name="name" label="Full name" state={state} autoComplete="name" required />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="phone" label="Phone number" type="tel" inputMode="tel" placeholder="03 123 456" hint="Farah will call or WhatsApp you on this number." state={state} autoComplete="tel" required />
        <Field name="email" label="Email" type="email" hint="To receive your order confirmation." state={state} autoComplete="email" optional />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field as="select" name="area" label="Region" state={state} required defaultValue="">
          <option value="" disabled>Choose your region</option>
          {LEBANON_AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Field>
        <Field name="city" label="City / area" placeholder="e.g. Achrafieh, Jounieh, Saida" state={state} autoComplete="address-level2" required />
      </div>
      <Field as="textarea" name="address" label="Full address" placeholder="Street, building, floor, nearby landmark" state={state} autoComplete="street-address" required />
      <Field as="textarea" name="notes" label="Notes" placeholder="Best time to deliver, gift message…" state={state} optional />

      <div className="rounded-xl bg-sand px-4 py-3 text-sm">
        <p className="font-medium">Payment: cash on delivery</p>
        <p className="mt-0.5 text-muted">Nothing to pay now. You pay {totalLabel} in cash (USD) when Farah delivers your painting.</p>
      </div>

      <FormError state={state} />
      <button type="submit" className="btn-primary w-full py-4 text-base" disabled={pending}>
        {pending && <Loader2 className="h-5 w-5 animate-spin" />} Place order
      </button>
      <p className="text-center text-xs text-muted">By ordering, the painting is reserved for you while Farah confirms delivery.</p>
    </form>
  );
}
