import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { CartButton } from "./cart/CartButton";
import { InstagramIcon } from "./icons";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NAV_LINKS } from "./nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-6 md:h-20">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm tracking-wide text-ink/80 transition hover:text-ink">
              {l.label}
            </Link>
          ))}
          <a
            href={siteConfig.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm transition hover:border-coral hover:text-coral-deep"
          >
            <InstagramIcon className="h-4 w-4" /> Follow
          </a>
          <CartButton className="-ml-2" />
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <a
            href={siteConfig.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2"
            aria-label="Follow Farah in Color on Instagram"
          >
            <InstagramIcon className="h-6 w-6" />
          </a>
          <CartButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
