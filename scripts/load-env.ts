import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Load `.env` into process.env (does not override existing vars). */
export function loadEnv(): void {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

export function requireSupabaseEnv(): { url: string; serviceRoleKey: string } {
  loadEnv();
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env\n" +
        "Run: npm run env:sync",
    );
    process.exit(1);
  }
  return { url, serviceRoleKey };
}
