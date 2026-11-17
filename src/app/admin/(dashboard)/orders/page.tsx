import Link from "next/link";
import { Phone } from "lucide-react";
import { updateOrderStatus } from "@/actions/admin";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { WhatsAppIcon } from "@/components/icons";
import { listOrders } from "@/lib/data/admin";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";
import { normalizeLebanesePhone, whatsappLink } from "@/lib/whatsapp";

export const metadata = { title: "Orders" };

const STATUS: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "delivered", label: "Delivered (paid)" },
  { value: "cancelled", label: "Cancelled" },
];
const TONE: Record<OrderStatus, string> = {
  new: "bg-coral/15 text-coral-deep",
  confirmed: "bg-saffron/20 text-[#6b4500]",
  delivered: "bg-teal/15 text-teal-deep",
  cancelled: "bg-ink/10 text-muted",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const orders = await listOrders(STATUS.some((s) => s.value === status) ? status : undefined);

  return (
    <>
      <PageHeader title="Orders" description="Confirmed → you agreed on delivery. Delivered → the paintings become Sold. Cancelled → they go back to Available." />
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ value: "", label: "All" }, ...STATUS].map((s) => (
          <Link
            key={s.value}
            href={s.value ? `/admin/orders?status=${s.value}` : "/admin/orders"}
            className={`rounded-full px-4 py-1.5 text-sm ${(status ?? "") === s.value ? "bg-ink text-white" : "bg-white text-ink/75 hover:text-ink"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <ul className="space-y-4">
        {orders.map((o) => {
          const wa = whatsappLink(o.phone, `Hello ${o.customer_name.split(" ")[0]}, this is Farah from Farah in Color about your order ${o.order_number} ("${o.painting_title}").`);
          return (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TONE[o.status]}`}>{o.status}</span>
                    <span className="text-sm text-muted">{o.order_number} · {formatDate(o.created_at)}</span>
                  </div>
                  <p className="mt-2 font-serif text-2xl">{o.painting_title}</p>
                  {(o.items?.length ?? 0) > 1 && (
                    <ul className="mt-1 text-sm text-muted">
                      {o.items!.map((i) => (
                        <li key={(i.painting_id ?? i.painting_title) + i.price_usd}>
                          {i.painting_slug ? <Link href={`/paintings/${i.painting_slug}`} target="_blank" className="underline-offset-2 hover:underline">{i.painting_title}</Link> : i.painting_title} · {formatPrice(i.price_usd)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <StatusSelect label={`Status of order ${o.order_number}`} value={o.status} options={STATUS} onChange={updateOrderStatus.bind(null, o.id)} />
              </div>

              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="eyebrow mb-1">Customer</p>
                  <p className="font-medium">{o.customer_name}</p>
                  <p>{o.phone}</p>
                  {o.email && <p className="break-all text-muted">{o.email}</p>}
                </div>
                <div>
                  <p className="eyebrow mb-1">Deliver to</p>
                  <p>{o.address}</p>
                  <p className="text-muted">{o.city}, {o.area}</p>
                </div>
                <div>
                  <p className="eyebrow mb-1">To collect (cash)</p>
                  <p className="font-serif text-2xl">{formatPrice(o.total_usd)}</p>
                  <p className="text-muted">{formatPrice(o.subtotal_usd)} + {o.delivery_fee_usd ? formatPrice(o.delivery_fee_usd) : "free"} delivery · {o.payment_status}</p>
                </div>
              </div>
              {o.notes && <p className="mt-4 rounded-lg bg-canvas px-3 py-2 text-sm"><b>Notes:</b> {o.notes}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-4 py-2"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>}
                <a href={`tel:+${normalizeLebanesePhone(o.phone)}`} className="btn-outline px-4 py-2"><Phone className="h-4 w-4" /> Call</a>
                {o.painting_slug && <Link href={`/paintings/${o.painting_slug}`} target="_blank" className="btn-outline px-4 py-2">View painting</Link>}
              </div>
            </li>
          );
        })}
        {orders.length === 0 && <li className="card p-8 text-center text-muted">No orders here yet.</li>}
      </ul>
    </>
  );
}
