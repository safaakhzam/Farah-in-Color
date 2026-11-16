import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { dashboardCounts, listOrders } from "@/lib/data/admin";
import { getPaintings } from "@/lib/data/paintings";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminHome() {
  const [counts, paintings, orders] = await Promise.all([dashboardCounts(), getPaintings(), listOrders()]);
  const available = paintings.filter((p) => p.status === "available").length;
  const soldValue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.subtotal_usd, 0);

  const stats = [
    { label: "New orders", value: counts.newOrders, href: "/admin/orders?status=new", tone: "text-coral-deep" },
    { label: "Orders to deliver", value: counts.activeOrders, href: "/admin/orders", tone: "" },
    { label: "New commission requests", value: counts.newCommissions, href: "/admin/commissions", tone: "" },
    { label: "Unread messages", value: counts.unreadMessages, href: "/admin/messages", tone: "" },
    { label: "Paintings available", value: available, href: "/admin/paintings", tone: "text-teal-deep" },
    { label: "Delivered sales", value: formatPrice(soldValue), href: "/admin/orders?status=delivered", tone: "" },
  ];

  return (
    <>
      <PageHeader
        title="Welcome back, Farah"
        description="Here's what's happening in your shop."
        action={<Link href="/admin/paintings/new" className="btn-primary"><Plus className="h-4 w-4" /> Add a painting</Link>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:border-ink/30">
            <p className={`font-serif text-4xl ${s.tone}`}>{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl">Latest orders</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm hover:text-coral-deep">All orders <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="card divide-y divide-line">
          {orders.slice(0, 5).map((o) => (
            <Link key={o.id} href="/admin/orders" className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-canvas">
              <div>
                <p className="font-medium">{o.painting_title}</p>
                <p className="text-muted">{o.customer_name} · {o.city} · {formatDate(o.created_at)}</p>
              </div>
              <span className="text-right">
                <span className="block font-medium">{formatPrice(o.total_usd)}</span>
                <span className="text-xs capitalize text-muted">{o.status}</span>
              </span>
            </Link>
          ))}
          {orders.length === 0 && <p className="p-6 text-sm text-muted">No orders yet. They will appear here.</p>}
        </div>
      </section>
    </>
  );
}
