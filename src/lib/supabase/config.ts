export function isSupabaseConfigured(): boolean {
  return Boolean(
    getSupabaseUrl() && (getSupabaseAnonKey() || getSupabaseServiceRoleKey()),
  );
}

function readEnv(key: string): string | undefined {
  const fromProcess = process.env[key];
  if (fromProcess) return fromProcess;
  const fromVite = import.meta.env?.[key];
  if (typeof fromVite === "string" && fromVite) return fromVite;
  return undefined;
}

export function getSupabaseUrl(): string | undefined {
  return (
    readEnv("SUPABASE_URL") ??
    readEnv("VITE_SUPABASE_URL") ??
    readEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    readEnv("SUPABASE_ANON_KEY") ??
    readEnv("VITE_SUPABASE_ANON_KEY") ??
    readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return (
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    readEnv("SUPABASE_SECRET_KEY")
  );
}

export function getPublicAppUrl(): string {
  return (
    readEnv("PUBLIC_APP_URL") ??
    readEnv("VITE_APP_URL") ??
    readEnv("NEXT_PUBLIC_APP_URL") ??
    "http://localhost:5173"
  );
}
