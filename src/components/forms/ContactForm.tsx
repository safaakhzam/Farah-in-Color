"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitContact } from "@/actions/forms";
import type { FormState } from "@/lib/validation";
import { Field, FormError, Honeypot } from "./Field";

export function ContactForm({ painting, compact = false }: { painting?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, {});

  if (state.ok) {
    return (
      <div className="card flex items-start gap-3 p-6" role="status">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-teal" />
        <div>
          <p className="font-medium">Thank you, your message is on its way.</p>
          <p className="mt-1 text-sm text-muted">Farah usually replies within a day or two.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="relative space-y-4" noValidate>
      <Honeypot />
      {painting && <input type="hidden" name="painting" value={painting} />}
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field name="name" label="Your name" state={state} autoComplete="name" required />
        <Field name="email" label="Email" type="email" state={state} autoComplete="email" required />
      </div>
      <Field name="phone" label="Phone / WhatsApp" type="tel" state={state} autoComplete="tel" optional />
      <Field
        as="textarea"
        name="message"
        label="Message"
        state={state}
        required
        defaultValue={painting ? `Hi Farah, I'm interested in "${painting}". ` : undefined}
      />
      <FormError state={state} />
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Send message
      </button>
    </form>
  );
}
