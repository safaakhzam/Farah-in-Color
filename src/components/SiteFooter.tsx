import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { whatsappLink } from "@/lib/whatsapp";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { Logo } from "./Logo";
import { NAV_LINKS } from "./nav";

export function SiteFooter({ whatsappNumber }: { whatsappNumber: string }) {
  const wa = whatsappLink(whatsappNumber, "Hello Farah! I found you on your website.");
  return (
    <footer className="mt-24 border-t border-line bg-sand/60">
      <div className="bg-color-gradient h-1" aria-hidden />
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Original paintings on canvas, made with love in Lebanon. Every piece is one of a kind.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-coral-deep">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Stay in touch</p>
          <div className="flex flex-wrap gap-3">
            <a href={siteConfig.instagram.url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <InstagramIcon className="h-4 w-4" /> @{siteConfig.instagram.handle}
            </a>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
          <p className="mt-6 text-sm text-muted">
            Delivery across {siteConfig.country} · Cash on delivery · Prices in USD
          </p>
        </div>
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Farah in Color. All artworks and images are protected by copyright.</p>
        <Link href="/admin" className="hover:text-ink">
          Artist login
        </Link>
      </div>
    </footer>
  );
}
