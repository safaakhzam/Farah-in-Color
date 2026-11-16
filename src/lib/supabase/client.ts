"use client";
import { createBrowserClient } from "@supabase/ssr";

/** Browser client, used by the admin area to upload painting images directly to Storage. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
