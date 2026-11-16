"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { changePassword, saveSettings } from "@/actions/admin";
import { Field, FormError } from "@/components/forms/Field";
import type { SiteSettings } from "@/lib/types";
import type { FormState } from "@/lib/validation";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, {});
  return (
    <form action={action} className="card space-y-5 p-5 sm:p-8" noValidate>
      <h2 className="text-2xl">Shop settings</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="delivery_fee_usd" label="Delivery fee (USD $)" type="number" min={0} step="1" state={state} defaultValue={String(settings.delivery_fee_usd)} hint="Flat fee anywhere in Lebanon. 0 = always free." />
        <Field name="free_shipping_threshold_usd" label="Free delivery from (USD $)" type="number" min={0} step="1" state={state} defaultValue={settings.free_shipping_threshold_usd == null ? "" : String(settings.free_shipping_threshold_usd)} optional hint="Leave empty to never offer free delivery." />
      </div>
      <Field name="whatsapp_number" label="Your WhatsApp number" type="tel" state={state} defaultValue={settings.whatsapp_number} placeholder="961 3 123 456" hint="With country code 961. Used for all WhatsApp buttons on the website." />
      <Field name="notification_email" label="Email for new orders & messages" type="email" state={state} defaultValue={settings.notification_email} />
      <FormError state={state} />
      {state.ok && <p role="status" className="text-sm text-teal-deep">Saved! The website has been updated.</p>}
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save settings
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="card space-y-4 p-5 sm:p-8">
      <h2 className="text-2xl">Change password</h2>
      <div>
        <label htmlFor="new-password" className="field-label">New password</label>
        <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} className="field" />
      </div>
      {state.error && <p className="field-error">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-teal-deep">Password updated.</p>}
      <button type="submit" className="btn-outline" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Update password
      </button>
    </form>
  );
}
