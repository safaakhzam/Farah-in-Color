import type { Metadata } from "next";
import { CartCheckout } from "@/components/cart/CartCheckout";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = { title: "Your cart", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div className="container-page pb-10 pt-8 md:pt-12">
      <CartCheckout deliveryFee={settings.delivery_fee_usd} freeShippingThreshold={settings.free_shipping_threshold_usd} />
    </div>
  );
}
