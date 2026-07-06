import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import type { CookieSerializeOptions } from "cookie-es";
import { getSupabaseAnonKey, getSupabaseUrl } from "./config";

export function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        const store = getCookies();
        return Object.entries(store).map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, (options ?? {}) as CookieSerializeOptions);
        });
      },
    },
  });
}
