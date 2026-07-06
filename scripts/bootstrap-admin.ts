/**
 * Promote a user to super_admin by email.
 * Usage: npm run admin:bootstrap -- your@email.com
 */
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "./load-env";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:bootstrap -- <email>");
  process.exit(1);
}

const { url, serviceRoleKey } = requireSupabaseEnv();

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(`No auth user found for ${email}. Sign up at /login first, then re-run.`);
    process.exit(1);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "super_admin" })
    .eq("id", user.id);

  if (error) throw error;
  console.log(`Promoted ${email} to super_admin`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
