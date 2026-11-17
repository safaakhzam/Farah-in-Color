import "server-only";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { samplePaintings } from "@/lib/sample-data";
import type { Commission, ContactMessage, Order } from "@/lib/types";

/* Data for the admin dashboard. Always call requireAdmin() before these. */

const demoOrders: Order[] = [
  {
    id: "demo-order-1", order_number: "FIC-1002", painting_id: samplePaintings[2].id, painting_title: samplePaintings[2].title,
    painting_slug: samplePaintings[2].slug, customer_name: "Rania Haddad", phone: "03 123 456", email: "rania@example.com",
    city: "Achrafieh", area: "Beirut", address: "Sursock St., Bldg 12, 3rd floor", notes: "Please call before coming.",
    subtotal_usd: 1200, delivery_fee_usd: 5, total_usd: 1205, payment_method: "cod", payment_status: "unpaid",
    status: "new", created_at: new Date(Date.now() - 3600_000 * 5).toISOString(),
  },
  {
    id: "demo-order-2", order_number: "FIC-1001", painting_id: samplePaintings[4].id, painting_title: samplePaintings[4].title,
    painting_slug: samplePaintings[4].slug, customer_name: "Karim Nassar", phone: "71 555 010", email: null,
    city: "Jounieh", area: "Mount Lebanon", address: "Main road, near the church", notes: null,
    subtotal_usd: 430, delivery_fee_usd: 5, total_usd: 435, payment_method: "cod", payment_status: "paid",
    status: "delivered", created_at: new Date(Date.now() - 86400_000 * 6).toISOString(),
  },
];

const demoCommissions: Commission[] = [
  {
    id: "demo-c-1", name: "Maya Khoury", email: "maya@example.com", phone: "76 222 333", size: "120 × 80 cm, above my sofa",
    colors: "Olive green, terracotta, a touch of gold", budget_usd: 900,
    description: "A calm Mediterranean landscape for our new living room. Lots of light!", reference_images: [],
    status: "new", created_at: new Date(Date.now() - 86400_000).toISOString(),
  },
];

const demoMessages: ContactMessage[] = [
  {
    id: "demo-m-1", name: "Lea", email: "lea@example.com", phone: null, message: "Hi Farah, do you ship to Tripoli? I love Two Shores!",
    painting_slug: "Two Shores", handled: false, created_at: new Date(Date.now() - 7200_000).toISOString(),
  },
];

export async function listOrders(status?: string): Promise<Order[]> {
  if (isDemoMode) return demoOrders.filter((o) => !status || o.status === status);
  let q = createSupabaseAdminClient().from("orders").select("*, items:order_items(painting_id, painting_title, painting_slug, price_usd)").order("created_at", { ascending: false }).limit(300);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) console.error(error.message);
  return (data ?? []).map((o) => ({
    ...o,
    subtotal_usd: Number(o.subtotal_usd),
    delivery_fee_usd: Number(o.delivery_fee_usd),
    total_usd: Number(o.total_usd),
    items: ((o.items ?? []) as Order["items"])!.map((i) => ({ ...i, price_usd: Number(i.price_usd) })),
  }));
}

export async function listCommissions(): Promise<(Commission & { imageUrls: string[] })[]> {
  if (isDemoMode) return demoCommissions.map((c) => ({ ...c, imageUrls: [] }));
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("commissions").select("*").order("created_at", { ascending: false }).limit(300);
  const rows = (data ?? []) as Commission[];
  // Reference images are private: create temporary (1 hour) links to view them.
  const allPaths = rows.flatMap((r) => r.reference_images);
  const signed = allPaths.length
    ? (await supabase.storage.from("commissions").createSignedUrls(allPaths, 3600)).data ?? []
    : [];
  const urlOf = new Map(signed.map((s) => [s.path, s.signedUrl]));
  return rows.map((r) => ({ ...r, budget_usd: r.budget_usd == null ? null : Number(r.budget_usd), imageUrls: r.reference_images.map((p) => urlOf.get(p)).filter((u): u is string => Boolean(u)) }));
}

export async function listMessages(): Promise<ContactMessage[]> {
  if (isDemoMode) return demoMessages;
  const { data } = await createSupabaseAdminClient().from("messages").select("*").order("created_at", { ascending: false }).limit(300);
  return (data ?? []) as ContactMessage[];
}

export async function dashboardCounts() {
  if (isDemoMode) {
    return { newOrders: 1, activeOrders: 1, newCommissions: 1, unreadMessages: 1 };
  }
  const s = createSupabaseAdminClient();
  const count = async (table: string, col: string, val: string | boolean, op: "eq" | "in" = "eq") => {
    let q = s.from(table).select("id", { count: "exact", head: true });
    q = op === "in" ? q.in(col, val as unknown as string[]) : q.eq(col, val);
    const { count } = await q;
    return count ?? 0;
  };
  const [newOrders, activeOrders, newCommissions, unreadMessages] = await Promise.all([
    count("orders", "status", "new"),
    count("orders", "status", ["new", "confirmed"] as unknown as string, "in"),
    count("commissions", "status", "new"),
    count("messages", "handled", false),
  ]);
  return { newOrders, activeOrders, newCommissions, unreadMessages };
}
