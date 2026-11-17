import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons";
import { ClearCart } from "@/components/cart/ClearCart";
import { getPaintings } from "@/lib/data/paintings";
import { getSettings } from "@/lib/data/settings";
import { formatPrice } from "@/lib/format";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Thank you for your order", robots: { index: false } };
export const dynamic = "force-dynamic";

type Summary = { orderNumber: string; firstName: string; paintingTitle: string; total: number | null; paintingIds: string[]; count: number };

async function loadSummary(sp: Record<string, string | undefined>): Promise<Summary | null> {
  if (isDemoMode || sp.demo) {
    const slugs = (sp.p ?? "").split(",").filter(Boolean);
    const all = await getPaintings();
    const ps = all.filter((x) => slugs.includes(x.slug));
    return {
      orderNumber: "FIC-DEMO",
      firstName: sp.n ?? "",
      paintingTitle: ps.map((x) => x.title).join(", ") || "your painting",
      total: null,
      paintingIds: ps.map((x) => x.id),
      count: Math.max(ps.length, 1),
    };
  }
  if (!sp.id || !/^[0-9a-f-]{36}$/i.test(sp.id)) return null;
  const { data } = await createSupabaseAdminClient()
    .from("orders")
    .select("order_number, customer_name, painting_title, total_usd, painting_id, order_items(painting_id)")
    .eq("id", sp.id)
    .maybeSingle();
  if (!data) return null;
  const items = (data.order_items ?? []) as { painting_id: string | null }[];
  const ids = items.map((i) => i.painting_id).filter((x): x is string => Boolean(x));
  if (!ids.length && data.painting_id) ids.push(data.painting_id);
  return {
    orderNumber: data.order_number,
    firstName: data.customer_name.split(" ")[0],
    paintingTitle: data.painting_title,
    total: Number(data.total_usd),
    paintingIds: ids,
    count: Math.max(items.length, 1),
  };
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const [summary, settings] = await Promise.all([searchParams.then(loadSummary), getSettings()]);
  const wa = summary
    ? whatsappLink(settings.whatsapp_number, `Hello Farah! I just placed order ${summary.orderNumber} for "${summary.paintingTitle}".`)
    : null;

  return (
    <div className="container-page max-w-2xl py-16 text-center md:py-24">
      <CheckCircle2 className="mx-auto h-14 w-14 text-teal" aria-hidden />
      <h1 className="mt-6 text-4xl sm:text-5xl">
        Thank you{summary?.firstName ? `, ${summary.firstName}` : ""}!
      </h1>
      {summary ? (
        <>
          <ClearCart ids={summary.paintingIds} />
          <p className="mt-4 text-lg text-muted">
            Your order <span className="font-medium text-ink">{summary.orderNumber}</span> for <span className="font-serif italic text-ink">“{summary.paintingTitle}”</span> has been received, and {summary.count > 1 ? "the paintings are" : "the painting is"} now reserved for you.
          </p>
          <div className="card mx-auto mt-10 max-w-md space-y-4 p-6 text-left">
            <p className="flex gap-3"><span className="font-serif text-2xl text-coral-deep">1</span><span><b>Farah will contact you</b> by phone or WhatsApp within 1–2 days to confirm the delivery date and time.</span></p>
            <p className="flex gap-3"><span className="font-serif text-2xl text-[#a06a00]">2</span><span><b>Payment is cash on delivery</b>{summary.total != null ? `: ${formatPrice(summary.total)} in USD` : " in USD"}. Nothing to pay now.</span></p>
            <p className="flex gap-3"><span className="font-serif text-2xl text-teal-deep">3</span><span>{summary.count > 1 ? "Your paintings are" : "Your painting is"} <b>carefully wrapped and hand-delivered</b>.</span></p>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-8">
              <WhatsAppIcon className="h-4 w-4" /> Message Farah on WhatsApp
            </a>
          )}
        </>
      ) : (
        <p className="mt-4 text-muted">Your order has been received. Farah will contact you to confirm delivery. Payment is cash on delivery.</p>
      )}
      <div className="mt-6">
        <Link href="/shop" className="text-sm font-medium underline underline-offset-4 hover:text-coral-deep">Continue browsing</Link>
      </div>
    </div>
  );
}
