/**
 * Seed Supabase with groups from static data.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-groups.ts
 */
import { createClient } from "@supabase/supabase-js";
import { GROUPS, slugify } from "../src/lib/groups-data";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data: wards } = await supabase.from("wards").select("id, name");
  const wardMap = new Map(wards?.map((w) => [w.name, w.id]) ?? []);

  for (const g of GROUPS) {
    const wardId = wardMap.get(g.ward);
    if (!wardId) {
      console.warn(`Ward not found: ${g.ward}`);
      continue;
    }

    const cycleNum = parseInt(g.cycle.replace(/\D/g, ""), 10) || 1;

    const { error } = await supabase.from("groups").upsert(
      {
        slug: slugify(g.name),
        name: g.name,
        ward_id: wardId,
        focus: g.focus,
        member_count: g.members,
        savings_total: g.savingsNum * 1_000_000,
        savings_display: g.savings,
        readiness_score: g.readiness,
        tier: g.tier,
        cycle_number: cycleNum,
        cycle_label: g.cycle,
        repayment_rate: g.repayment,
        status: "active",
      },
      { onConflict: "slug" },
    );

    if (error) console.error(g.name, error.message);
    else console.log("Seeded:", g.name);
  }

  console.log("Done.");
}

main();
