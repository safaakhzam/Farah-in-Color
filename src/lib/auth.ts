import "server-only";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string; demo: boolean };

function allowed(email: string | undefined) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  // If no list is set, any signed-in user is an admin (public sign-ups must be disabled in Supabase).
  return Boolean(email) && (list.length === 0 || list.includes(email!.toLowerCase()));
}

/** The signed-in admin, or null. In demo mode everyone gets a read-only demo admin. */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (isDemoMode) return { id: "demo", email: "demo@farahincolor.com", demo: true };
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !allowed(data.user.email)) return null;
  return { id: data.user.id, email: data.user.email!, demo: false };
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
