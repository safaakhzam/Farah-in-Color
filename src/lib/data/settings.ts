import "server-only";
import { siteConfig } from "@/lib/config";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SiteSettings } from "@/lib/types";

const defaults: SiteSettings = {
  delivery_fee_usd: siteConfig.shipping.deliveryFee,
  free_shipping_threshold_usd: siteConfig.shipping.freeShippingThreshold,
  whatsapp_number: siteConfig.whatsappNumber,
  notification_email: process.env.ARTIST_NOTIFICATION_EMAIL || "",
};

/**
 * Settings saved in Admin → Settings, falling back to config/env values.
 * Empty fields in the database fall back to the env variables.
 */
export async function getSettings(): Promise<SiteSettings> {
  if (isDemoMode || !process.env.SUPABASE_SERVICE_ROLE_KEY) return defaults;
  const { data, error } = await createSupabaseAdminClient()
    .from("settings")
    .select("delivery_fee_usd, free_shipping_threshold_usd, whatsapp_number, notification_email")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return defaults;
  return {
    delivery_fee_usd: Number(data.delivery_fee_usd ?? defaults.delivery_fee_usd),
    free_shipping_threshold_usd:
      data.free_shipping_threshold_usd == null ? null : Number(data.free_shipping_threshold_usd),
    whatsapp_number: data.whatsapp_number || defaults.whatsapp_number,
    notification_email: data.notification_email || defaults.notification_email,
  };
}
