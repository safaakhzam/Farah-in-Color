import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";
import { dashboardCounts } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const counts = await dashboardCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:flex md:gap-8 md:px-6 md:py-8">
      <aside className="md:w-56 md:shrink-0">
        <div className="mb-4 flex items-center justify-between md:mb-8 md:block">
          <Logo />
          <p className="text-xs text-muted md:mt-1">Dashboard</p>
        </div>
        <AdminNav badges={{ orders: counts.newOrders, commissions: counts.newCommissions, messages: counts.unreadMessages }} />
        <div className="mt-6 hidden space-y-1 border-t border-line pt-6 text-sm md:block">
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink">
            <ExternalLink className="h-4 w-4" /> View website
          </Link>
          <form action={signOut}>
            <button className="flex w-full items-center gap-2 px-3 py-2 text-muted hover:text-ink">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </form>
          <p className="truncate px-3 pt-2 text-xs text-muted">{user.email}</p>
        </div>
      </aside>
      <main className="mt-4 min-w-0 flex-1 md:mt-0">
        {user.demo && (
          <p className="mb-6 rounded-xl bg-saffron/20 px-4 py-3 text-sm text-[#5c3d00]">
            <b>Demo mode.</b> You are seeing sample data. Changes are not saved until Supabase is connected (see README).
          </p>
        )}
        {children}
        <form action={signOut} className="mt-12 md:hidden">
          <button className="btn-outline w-full"><LogOut className="h-4 w-4" /> Log out</button>
        </form>
      </main>
    </div>
  );
}
