"use server";

import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/data/settings";
import { sendAutoReply, sendSimpleNotification } from "@/lib/email";
import { commissionSchema, contactSchema, formValues, fieldErrorsOf, type FormState } from "@/lib/validation";

const MAX_REFERENCE_IMAGES = 5;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

/** Commission request: saves it, stores reference images privately, and notifies the artist. */
export async function submitCommission(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (values.website) return { ok: true };

  const parsed = commissionSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  }
  const input = parsed.data;

  const files = formData
    .getAll("references")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_REFERENCE_IMAGES);
  if (files.some((f) => !f.type.startsWith("image/") || f.size > MAX_IMAGE_BYTES)) {
    return { error: "Reference images must be pictures under 3 MB each.", values };
  }

  if (isDemoMode) return { ok: true };

  const supabase = createSupabaseAdminClient();
  const paths: string[] = [];
  for (const file of files) {
    const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("commissions").upload(path, file, { contentType: file.type });
    if (error) console.error("[commission] upload failed:", error.message);
    else paths.push(path);
  }

  const { error } = await supabase.from("commissions").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    size: input.size,
    colors: input.colors || null,
    budget_usd: input.budget === "" ? null : input.budget,
    description: input.description,
    reference_images: paths,
  });
  if (error) {
    console.error("[commission] save failed:", error.message);
    return { error: "Something went wrong. Please try again.", values };
  }

  const settings = await getSettings();
  await Promise.all([
    sendSimpleNotification(
      settings.notification_email,
      `New commission request from ${input.name}`,
      {
        Name: input.name,
        Email: input.email,
        Phone: input.phone,
        Size: input.size,
        Colors: input.colors,
        "Budget (USD)": input.budget === "" ? "" : `$${input.budget}`,
        Idea: input.description,
        "Reference images": paths.length ? `${paths.length} image(s), see Admin → Commissions` : "",
      },
      input.email,
    ),
    sendAutoReply(input.email, input.name, "commission"),
  ]);
  return { ok: true };
}

/** Contact form (also used by "Inquire about this piece"). */
export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData);
  if (values.website) return { ok: true };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Please check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error), values };
  }
  const input = parsed.data;
  if (isDemoMode) return { ok: true };

  const { error } = await createSupabaseAdminClient().from("messages").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    message: input.message,
    painting_slug: input.painting || null,
  });
  if (error) {
    console.error("[contact] save failed:", error.message);
    return { error: "Something went wrong. Please try again.", values };
  }

  const settings = await getSettings();
  await Promise.all([
    sendSimpleNotification(
      settings.notification_email,
      input.painting ? `Inquiry about "${input.painting}" from ${input.name}` : `New message from ${input.name}`,
      { Name: input.name, Email: input.email, Phone: input.phone, Painting: input.painting, Message: input.message },
      input.email,
    ),
    sendAutoReply(input.email, input.name, "message"),
  ]);
  return { ok: true };
}
