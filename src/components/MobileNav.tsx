"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { InstagramIcon } from "./icons";
import { NAV_LINKS } from "./nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 p-2"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <nav id="mobile-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-up bg-canvas px-6 py-10">
          <ul className="space-y-6">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-serif text-4xl" aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={siteConfig.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline mt-12 w-full"
          >
            <InstagramIcon className="h-5 w-5" /> Follow @{siteConfig.instagram.handle}
          </a>
          <div className="bg-color-gradient absolute inset-x-0 bottom-0 h-1.5" aria-hidden />
        </nav>
      )}
    </div>
  );
}
