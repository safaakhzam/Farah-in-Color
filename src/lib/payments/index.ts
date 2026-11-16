/**
 * Payment methods.
 *
 * Only Cash on Delivery is active today. To add online payment later (e.g. Stripe,
 * Whish, OMT Pay), add a new provider object here, set `enabled: true`, and handle
 * its `startCheckout` in the order action. Orders already store `payment_method`
 * and `payment_status`, so no database change is needed.
 */
export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  /** Online providers return a URL to redirect the customer to. COD returns null. */
  startCheckout?: (order: { id: string; total_usd: number }) => Promise<string | null>;
}

export const cashOnDelivery: PaymentMethod = {
  id: "cod",
  label: "Cash on delivery",
  description: "Pay in cash (USD) when your painting is delivered.",
  enabled: true,
  startCheckout: async () => null,
};

export const paymentMethods: PaymentMethod[] = [cashOnDelivery];

export const defaultPaymentMethod = cashOnDelivery;

export function getPaymentMethod(id: string) {
  return paymentMethods.find((m) => m.id === id && m.enabled) ?? defaultPaymentMethod;
}
