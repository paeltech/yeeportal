export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && (getSupabaseAnonKey() || getSupabaseServiceRoleKey()));
}

export function getSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? import.meta.env?.VITE_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env?.VITE_SUPABASE_ANON_KEY
  );
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getPublicAppUrl(): string {
  return (
    process.env.PUBLIC_APP_URL ??
    process.env.VITE_APP_URL ??
    import.meta.env?.VITE_APP_URL ??
    "http://localhost:5173"
  );
}
