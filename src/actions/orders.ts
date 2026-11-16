"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPaintingById } from "@/lib/data/paintings";
import { getSettings } from "@/lib/data/settings";
import { deliveryFeeFor } from "@/lib/shipping";
import { sendOrderEmails } from "@/lib/email";
import { defaultPaymentMethod } from "@/lib/payments";
import { orderSchema, formValues, fieldErrorsOf, type FormState } from "@/lib/validation";
import type { Order } from "@/lib/types";

const TAKEN = "Sorry, this painting has just been reserved by someone else.";

/**
 * Places a Cash-on-Delivery order.
 * The database function `place_order` reserves the painting atomically, so the
 * same original can never be sold twice.
 */
export async function placeOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (values.website) return { ok: true }; // honeypot: only bots fill this hidden field

  const parsed = orderSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  }
  const input = parsed.data;

  const painting = await getPaintingById(input.paintingId);
  if (!painting) return { error: "This painting could not be found.", values };
  if (painting.status !== "available") return { error: TAKEN, values };

  const settings = await getSettings();
  const deliveryFee = deliveryFeeFor(painting.price_usd, settings);

  // Demo mode: nothing is saved, we just show the confirmation page.
  if (isDemoMode) {
    const first = input.name.split(" ")[0];
    redirect(`/order/confirmation?demo=1&p=${encodeURIComponent(painting.slug)}&n=${encodeURIComponent(first)}`);
  }

  const { data, error } = await createSupabaseAdminClient().rpc("place_order", {
    p_painting_id: painting.id,
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
    if (error.message.includes("PAINTING_NOT_AVAILABLE")) return { error: TAKEN, values };
    console.error("[order] failed:", error.message);
    return { error: "Something went wrong. Please try again or contact Farah on WhatsApp.", values };
  }

  const order = data as Order;
  order.subtotal_usd = Number(order.subtotal_usd);
  order.delivery_fee_usd = Number(order.delivery_fee_usd);
  order.total_usd = Number(order.total_usd);

  await sendOrderEmails(order, settings.notification_email);

  revalidatePath("/", "layout"); // the painting now shows as Reserved everywhere
  redirect(`/order/confirmation?id=${order.id}`);
}
