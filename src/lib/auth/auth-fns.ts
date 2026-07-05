import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import type { AuthSession, UserProfile } from "./types";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
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

export const getAuthSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession | null> => {
    if (!isSupabaseConfigured()) {
      if (process.env.DEV_BYPASS_AUTH === "true") return DEV_MOCK_SESSION;
      return null;
    }

    const request = getRequest();
    const client = createSupabaseServerClient(request);
    if (!client) return null;

    const {
      data: { user },
    } = await client.supabase.auth.getUser();
    if (!user) return null;

    const admin = createSupabaseAdminClient();
    const { data: profile } = admin
      ? await admin.from("profiles").select("*").eq("id", user.id).single()
      : await client.supabase.from("profiles").select("*").eq("id", user.id).single();

    if (!profile) return null;

    return {
      userId: user.id,
      email: user.email ?? profile.email,
      profile: mapProfile(profile),
    };
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

    const request = getRequest();
    const client = createSupabaseServerClient(request);
    if (!client) throw new Error("Auth unavailable");

    const { data: authData, error } = await client.supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) throw new Error(error.message);

    const admin = createSupabaseAdminClient();
    const { data: profile } = admin
      ? await admin.from("profiles").select("*").eq("id", authData.user.id).single()
      : await client.supabase.from("profiles").select("*").eq("id", authData.user.id).single();

    if (!profile) throw new Error("Profile not found");

    return {
      session: {
        userId: authData.user.id,
        email: authData.user.email ?? data.email,
        profile: mapProfile(profile),
      } satisfies AuthSession,
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  if (!isSupabaseConfigured()) return { success: true };

  const request = getRequest();
  const client = createSupabaseServerClient(request);
  if (!client) return { success: true };

  await client.supabase.auth.signOut();
  return { success: true };
});

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["super_admin", "program_manager", "field_officer", "group_leader", "member"]),
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

  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin.from("profiles").select("*").order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProfile);
});
