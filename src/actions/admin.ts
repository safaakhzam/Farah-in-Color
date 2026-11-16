"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { siteConfig } from "@/lib/config";
import { slugify } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommissionStatus, OrderStatus, PaintingImage, PaintingStatus } from "@/lib/types";
import { fieldErrorsOf, formValues, type FormState } from "@/lib/validation";

const DEMO_MSG = "Demo mode: connect Supabase to save changes (see README).";

/** Refresh every public page so changes appear immediately. */
function refreshSite() {
  revalidatePath("/", "layout");
}

/* ───────────────────────── Auth ───────────────────────── */

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) redirect("/admin");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password.", values: { email } };
  redirect("/admin");
}

/** Emails a one-time login link (for a forgotten password). */
export async function sendLoginLink(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isDemoMode) return { error: DEMO_MSG };
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Enter your email first." };
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${siteConfig.url}/auth/callback` },
  });
  // Same message whether or not the account exists.
  return { ok: true };
}

export async function signOut() {
  if (!isDemoMode) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.message } : { ok: true };
}

/* ───────────────────────── Paintings ───────────────────────── */

const paintingSchema = z.object({
  id: z.string().default(""),
  title: z.string().trim().min(1, "Give the painting a title").max(120),
  slug: z.string().trim().max(80).default(""),
  price_usd: z.coerce.number({ message: "Enter a price" }).min(0, "Price can't be negative"),
  status: z.enum(["available", "reserved", "sold"]),
  medium: z.string().trim().min(1).max(80),
  width_cm: z.union([z.literal(""), z.coerce.number().positive()]).default(""),
  height_cm: z.union([z.literal(""), z.coerce.number().positive()]).default(""),
  year: z.union([z.literal(""), z.coerce.number().int().min(1900).max(2100)]).default(""),
  collection: z.string().trim().max(80).default(""),
  style: z.string().trim().max(80).default(""),
  description: z.string().trim().max(5000).default(""),
  sort_order: z.coerce.number().int().default(0),
});

export async function savePainting(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  if (isDemoMode) return { error: DEMO_MSG, values };

  const parsed = paintingSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  const v = parsed.data;

  let images: PaintingImage[] = [];
  try {
    images = JSON.parse(String(formData.get("images") || "[]"));
  } catch {
    /* keep empty */
  }
  images = images.map((img) => ({ ...img, alt: img.alt?.trim() || `${v.title}, ${v.medium.toLowerCase()} by Farah in Color` }));

  const colors = formData.getAll("colors").map(String).map((c) => c.trim().toLowerCase()).filter(Boolean);
  const extraColors = String(formData.get("extra_colors") || "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const row = {
    title: v.title,
    slug: slugify(v.slug || v.title) || `painting-${Date.now()}`,
    price_usd: v.price_usd,
    status: v.status,
    featured: formData.get("featured") === "on",
    medium: v.medium,
    width_cm: v.width_cm === "" ? null : v.width_cm,
    height_cm: v.height_cm === "" ? null : v.height_cm,
    year: v.year === "" ? null : v.year,
    collection: v.collection || null,
    style: v.style || null,
    description: v.description,
    colors: [...new Set([...colors, ...extraColors])],
    images,
    sort_order: v.sort_order,
  };

  const supabase = createSupabaseAdminClient();
  const { error } = v.id
    ? await supabase.from("paintings").update(row).eq("id", v.id)
    : await supabase.from("paintings").insert(row);

  if (error) {
    if (error.code === "23505") {
      return { error: "Another painting already uses this web address (slug). Change the title or slug.", values };
    }
    return { error: error.message, values };
  }
  refreshSite();
  redirect("/admin/paintings?saved=1");
}

export async function deletePainting(id: string) {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("paintings").select("images").eq("id", id).maybeSingle();
  const paths = ((data?.images ?? []) as PaintingImage[]).map((i) => i.path).filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from("paintings").remove(paths);
  const { error } = await supabase.from("paintings").delete().eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  redirect("/admin/paintings");
}

export async function setPaintingStatus(id: string, status: PaintingStatus) {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const { error } = await createSupabaseAdminClient().from("paintings").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  refreshSite();
  return { ok: true };
}

/* ───────────────────────── Orders ───────────────────────── */

/**
 * Changing an order's status keeps the painting in sync:
 *   new / confirmed → painting Reserved
 *   delivered       → painting Sold (and order marked paid)
 *   cancelled       → painting back to Available
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const supabase = createSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .update({ status, ...(status === "delivered" ? { payment_status: "paid" } : {}) })
    .eq("id", orderId)
    .select("painting_id")
    .single();
  if (error) return { error: error.message };

  if (order?.painting_id) {
    const paintingStatus: PaintingStatus =
      status === "delivered" ? "sold" : status === "cancelled" ? "available" : "reserved";

    if (paintingStatus === "available") {
      // Only free the painting if no other active order holds it.
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("painting_id", order.painting_id)
        .in("status", ["new", "confirmed", "delivered"]);
      if (!count) await supabase.from("paintings").update({ status: "available" }).eq("id", order.painting_id);
    } else {
      await supabase.from("paintings").update({ status: paintingStatus }).eq("id", order.painting_id);
    }
  }
  refreshSite();
  return { ok: true };
}

/* ───────────────────────── Commissions & messages ───────────────────────── */

export async function updateCommissionStatus(id: string, status: CommissionStatus) {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const { error } = await createSupabaseAdminClient().from("commissions").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setMessageHandled(id: string, handled: boolean) {
  await requireAdmin();
  if (isDemoMode) return { error: DEMO_MSG };
  const { error } = await createSupabaseAdminClient().from("messages").update({ handled }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ───────────────────────── Settings ───────────────────────── */

const settingsSchema = z.object({
  delivery_fee_usd: z.coerce.number().min(0, "Can't be negative"),
  free_shipping_threshold_usd: z.union([z.literal(""), z.coerce.number().min(0)]).default(""),
  whatsapp_number: z.string().trim().max(20).default(""),
  notification_email: z.union([z.literal(""), z.email("Enter a valid email")]).default(""),
});

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const values = formValues(formData);
  if (isDemoMode) return { error: DEMO_MSG, values };
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  const v = parsed.data;
  const { error } = await createSupabaseAdminClient()
    .from("settings")
    .update({
      delivery_fee_usd: v.delivery_fee_usd,
      free_shipping_threshold_usd: v.free_shipping_threshold_usd === "" ? null : v.free_shipping_threshold_usd,
      whatsapp_number: v.whatsapp_number.replace(/\D/g, ""),
      notification_email: v.notification_email,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: error.message, values };
  refreshSite();
  return { ok: true, values };
}
