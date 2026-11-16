import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

/** Floating WhatsApp button (bottom right). Hidden until a WhatsApp number is set. */
export function WhatsAppFloat({ number }: { number: string }) {
  const href = whatsappLink(number, "Hello Farah! I have a question about your paintings.");
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Farah on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-black/15 transition hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
