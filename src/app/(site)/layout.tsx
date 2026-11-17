import { CartProvider } from "@/components/cart/CartProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { getSettings } from "@/lib/data/settings";
import { isDemoMode } from "@/lib/supabase/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <CartProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      {isDemoMode && (
        <div className="bg-ink px-4 py-2 text-center text-xs text-white/90">
          Preview mode: sample paintings shown, orders are not saved. Connect Supabase to go live (see README).
        </div>
      )}
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter whatsappNumber={settings.whatsapp_number} />
      <WhatsAppFloat number={settings.whatsapp_number} />
    </CartProvider>
  );
}
