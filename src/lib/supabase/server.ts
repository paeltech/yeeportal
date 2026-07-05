import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from "./config";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

export function createSupabaseServerClient(request: Request) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map((c) => ({
          name: c.name,
          value: c.value ?? "",
        }));
      },
      setAll(cookies) {
        cookies.forEach((cookie) => cookiesToSet.push(cookie));
      },
    },
  });

  return { supabase, cookiesToSet };
}

export function createSupabaseAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() ?? getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function applySupabaseCookies(response: Response, cookiesToSet: CookieToSet[]): Response {
  if (cookiesToSet.length === 0) return response;

  const headers = new Headers(response.headers);
  cookiesToSet.forEach(({ name, value, options }) => {
    headers.append("Set-Cookie", serializeCookieHeader(name, value, options ?? {}));
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
