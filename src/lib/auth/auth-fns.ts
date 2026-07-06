import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { AuthSession, UserProfile } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const DEV_MOCK_SESSION: AuthSession = {
  userId: "00000000-0000-0000-0000-000000000001",
  email: "admin@yee.or.tz",
  profile: {
    id: "00000000-0000-0000-0000-000000000001",
    fullName: "Demo Admin",
    email: "admin@yee.or.tz",
    role: "super_admin",
    wardId: null,
    groupId: null,
    phone: null,
  },
};

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    role: row.role as UserProfile["role"],
    wardId: (row.ward_id as string) ?? null,
    groupId: (row.group_id as string) ?? null,
    phone: (row.phone as string) ?? null,
  };
}

async function loadProfile(userId: string, email: string | undefined): Promise<AuthSession | null> {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const { createSupabaseServerClient } = await import("@/lib/supabase/server-cookies");

  const admin = createSupabaseAdminClient();
  const supabase = createSupabaseServerClient();

  let profileRow: Record<string, unknown> | null = null;

  if (admin) {
    const { data } = await admin.from("profiles").select("*").eq("id", userId).maybeSingle();
    profileRow = data;
  } else if (supabase) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    profileRow = data;
  }

  if (!profileRow && admin && email) {
    const { data: created, error } = await admin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: email.split("@")[0],
        role: "member",
      })
      .select("*")
      .single();
    if (!error && created) profileRow = created;
  }

  if (!profileRow) return null;

  return {
    userId,
    email: email ?? (profileRow.email as string),
    profile: mapProfile(profileRow),
  };
}

export const getAuthSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession | null> => {
    if (!isSupabaseConfigured()) {
      if (process.env.DEV_BYPASS_AUTH === "true") return DEV_MOCK_SESSION;
      return null;
    }

    const { createSupabaseServerClient } = await import("@/lib/supabase/server-cookies");
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    return loadProfile(user.id, user.email);
  },
);

export const signIn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    if (!isSupabaseConfigured()) {
      if (process.env.DEV_BYPASS_AUTH === "true" && data.email === "admin@yee.or.tz") {
        return { session: DEV_MOCK_SESSION };
      }
      throw new Error(
        "Supabase is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to your environment.",
      );
    }

    const { createSupabaseServerClient } = await import("@/lib/supabase/server-cookies");
    const supabase = createSupabaseServerClient();
    if (!supabase) throw new Error("Auth unavailable");

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);

    const session = await loadProfile(authData.user.id, authData.user.email ?? data.email);
    if (!session) throw new Error("Profile not found");

    return { session };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  if (!isSupabaseConfigured()) return { success: true };

  const { createSupabaseServerClient } = await import("@/lib/supabase/server-cookies");
  const supabase = createSupabaseServerClient();
  if (!supabase) return { success: true };

  await supabase.auth.signOut();
  return { success: true };
});

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum([
          "super_admin",
          "program_manager",
          "field_officer",
          "group_leader",
          "member",
        ]),
        groupId: z.string().uuid().nullable().optional(),
        wardId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || session.profile.role !== "super_admin") {
      throw new Error("Unauthorized");
    }

    const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
    const admin = createSupabaseAdminClient();
    if (!admin) throw new Error("Database unavailable");

    const { error } = await admin
      .from("profiles")
      .update({
        role: data.role,
        group_id: data.groupId ?? null,
        ward_id: data.wardId ?? null,
      })
      .eq("id", data.userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const fetchAllProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  if (!session || session.profile.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  const { createSupabaseAdminClient } = await import("@/lib/supabase/server");
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin.from("profiles").select("*").order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProfile);
});
