"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaintings } from "@/lib/data/paintings";
import { getSettings } from "@/lib/data/settings";
import { deliveryFeeFor } from "@/lib/shipping";
import { sendOrderEmails } from "@/lib/email";
import { defaultPaymentMethod } from "@/lib/payments";
import { orderSchema, formValues, fieldErrorsOf, type FormState } from "@/lib/validation";
import type { Order } from "@/lib/types";

/**
 * Places a Cash-on-Delivery order for one painting ("Order now") or several (the cart).
 * The database function `place_cart_order` locks and reserves every painting in one
 * step, so an original can never be sold twice. If any painting was taken meanwhile,
 * nothing is ordered and the customer is told which one.
 */
export async function placeOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (values.website) return { ok: true }; // honeypot: only bots fill this hidden field

  const parsed = orderSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  }
  const input = parsed.data;

  const all = await getPaintings();
  const paintings = input.paintingIds.map((id) => all.find((p) => p.id === id));
  if (paintings.some((p) => !p)) return { error: "One of these paintings could not be found. Please review your cart.", values };
  const taken = paintings.filter((p) => p!.status !== "available").map((p) => p!.title);
  if (taken.length) return { error: soldMessage(taken.join(", ")), values };

  const subtotal = paintings.reduce((s, p) => s + p!.price_usd, 0);
  const settings = await getSettings();
  const deliveryFee = deliveryFeeFor(subtotal, settings);

  // Demo mode: nothing is saved, we just show the confirmation page.
  if (isDemoMode) {
    const first = input.name.split(" ")[0];
    const slugs = paintings.map((p) => p!.slug).join(",");
    redirect(`/order/confirmation?demo=1&p=${encodeURIComponent(slugs)}&n=${encodeURIComponent(first)}`);
  }

  const { data, error } = await createSupabaseAdminClient().rpc("place_cart_order", {
    p_painting_ids: input.paintingIds,
    p_customer_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_city: input.city,
    p_area: input.area,
    p_address: input.address,
    p_notes: input.notes,
    p_delivery_fee: deliveryFee,
    p_payment_method: defaultPaymentMethod.id,
  });

  if (error) {
    const m = error.message.match(/PAINTING_NOT_AVAILABLE:(.*)/);
    if (m) return { error: soldMessage(m[1].trim()), values };
    console.error("[order] failed:", error.message);
    return { error: "Something went wrong. Please try again or contact Farah on WhatsApp.", values };
  }

  const order = data as Order;
  order.subtotal_usd = Number(order.subtotal_usd);
  order.delivery_fee_usd = Number(order.delivery_fee_usd);
  order.total_usd = Number(order.total_usd);
  order.items = paintings.map((p) => ({ painting_id: p!.id, painting_title: p!.title, painting_slug: p!.slug, price_usd: p!.price_usd }));

  await sendOrderEmails(order, settings.notification_email);

  revalidatePath("/", "layout"); // the paintings now show as Reserved everywhere
  redirect(`/order/confirmation?id=${order.id}`);
}

function soldMessage(titles: string) {
  return `Sorry, ${titles} ${titles.includes(",") ? "have" : "has"} just been reserved by someone else. Please remove it from your cart and try again.`;
}
