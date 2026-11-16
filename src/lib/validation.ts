import { z } from "zod";
import { LEBANON_AREAS } from "./lebanon";

const trimmed = (max: number) => z.string().trim().max(max);

/** Lebanese mobile/landline: 7–8 local digits, optionally with +961 / 00961 / 0 prefix. */
const lebanesePhone = z
  .string()
  .trim()
  .refine(
    (v) => /^(\+?961|00961|0)?\s*\d[\d\s-]{6,10}$/.test(v),
    "Please enter a valid Lebanese phone number",
  );

export const orderSchema = z.object({
  paintingId: z.string().min(1),
  name: trimmed(100).min(2, "Please enter your full name"),
  phone: lebanesePhone,
  email: z.union([z.literal(""), z.email("Please enter a valid email")]).default(""),
  area: z.enum(LEBANON_AREAS, { message: "Please choose your region" }),
  city: trimmed(100).min(2, "Please enter your city or town"),
  address: trimmed(500).min(5, "Please enter your full address"),
  notes: trimmed(1000).default(""),
});

export const commissionSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: trimmed(30).default(""),
  size: trimmed(100).min(1, "Please tell us the size you have in mind"),
  colors: trimmed(300).default(""),
  budget: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]).default(""),
  description: trimmed(3000).min(10, "Tell Farah a little about your idea"),
});

export const contactSchema = z.object({
  name: trimmed(100).min(2, "Please enter your name"),
  email: z.email("Please enter a valid email"),
  phone: trimmed(30).default(""),
  message: trimmed(3000).min(5, "Please write a message"),
  painting: trimmed(120).default(""),
});

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
};

/** Turns FormData into a plain object of strings (files are skipped). */
export function formValues(fd: FormData) {
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") out[k] = v;
  });
  return out;
}

export function fieldErrorsOf(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
}
