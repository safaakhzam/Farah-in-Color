/**
 * Site-wide settings.
 *
 * Most day-to-day values (delivery fee, WhatsApp number, notification email)
 * can be changed by the artist in Admin → Settings once Supabase is connected.
 * The values below are the defaults used when nothing is saved there yet.
 */
export const siteConfig = {
  name: "Farah in Color",
  tagline: "Original paintings on canvas",
  description:
    "Original, one-of-a-kind canvas paintings by Farah. Browse the gallery and order with cash on delivery anywhere in Lebanon.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),

  /**
   * To use a logo instead of the text wordmark, put the file in /public
   * (for example /public/logo.svg) and set `logo` to "/logo.svg".
   */
  logo: null as string | null,

  instagram: {
    handle: "farahincolor",
    url: "https://instagram.com/farahincolor",
  },

  /** International format, digits only, e.g. "9613123456". Set via env or Admin → Settings. */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",

  currency: "USD",
  country: "Lebanon",

  shipping: {
    /** Flat delivery fee in USD anywhere in Lebanon. */
    deliveryFee: 5,
    /** Orders at or above this amount ship free. `null` = never free. */
    freeShippingThreshold: null as number | null,
  },

  /**
   * Size bands are worked out from the longest side of the canvas (in cm).
   * Adjust the limits here if you prefer different bands.
   */
  sizeBands: {
    smallMax: 40, // longest side < 40 cm  → Small
    mediumMax: 80, // 40–80 cm               → Medium, above → Large
  },
} as const;

export type SizeBand = "small" | "medium" | "large" | "unknown";
