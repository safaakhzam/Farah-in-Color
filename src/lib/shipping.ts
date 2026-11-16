import type { SiteSettings } from "./types";

export function deliveryFeeFor(subtotal: number, settings: SiteSettings) {
  const threshold = settings.free_shipping_threshold_usd;
  if (threshold != null && subtotal >= threshold) return 0;
  return settings.delivery_fee_usd;
}
