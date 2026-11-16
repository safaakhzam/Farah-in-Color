"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brush, Inbox, LayoutDashboard, MessageSquare, Package, Settings } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/paintings", label: "Paintings", icon: Brush },
  { href: "/admin/orders", label: "Orders", icon: Package, badge: "orders" },
  { href: "/admin/commissions", label: "Commissions", icon: Inbox, badge: "commissions" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
      {links.map((l) => {
        const active = "exact" in l ? pathname === l.href : pathname.startsWith(l.href);
        const count = "badge" in l ? badges[l.badge] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-ink text-white" : "text-ink/75 hover:bg-white"}`}
          >
            <l.icon className="h-4 w-4" />
            {l.label}
            {count > 0 && <span className="ml-auto rounded-full bg-coral-deep px-2 py-0.5 text-xs text-white">{count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
