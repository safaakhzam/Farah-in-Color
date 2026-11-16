/** Builds a wa.me link. `number` must be international digits (e.g. 9613123456). */
export function whatsappLink(number: string, message?: string) {
  const digits = normalizeLebanesePhone(number);
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/**
 * Turns local Lebanese numbers like "03 123 456" or "+961 3 123456" into "9613123456".
 * Numbers already in international format are kept as they are.
 */
export function normalizeLebanesePhone(input: string) {
  let d = (input || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("961")) return d;
  if (d.startsWith("0")) d = d.slice(1);
  // Local numbers are 7–8 digits (e.g. 3 123 456, 71 123 456)
  if (d.length >= 7 && d.length <= 8) return `961${d}`;
  return d;
}
