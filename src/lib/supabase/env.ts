/** True when Supabase keys are configured. Otherwise the site runs in demo mode. */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const isDemoMode = !isSupabaseConfigured;
