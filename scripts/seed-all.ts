/**
 * Full database seed: wards, training modules, groups, documents.
 * Usage: npm run db:seed
 */
import { createClient } from "@supabase/supabase-js";
import { GROUPS, slugify, getGroupDetails } from "../src/lib/groups-data";
import { seedGroupDocuments } from "../src/lib/documents/seed";
import { requireSupabaseEnv } from "./load-env";

const { url, serviceRoleKey: key } = requireSupabaseEnv();

const supabase = createClient(url, key);

const WARDS = ["Kinondoni", "Temeke", "Ilala", "Ubungo", "Kigamboni"];

const TRAINING_MODULES = [
  "Financial literacy",
  "Entrepreneurship",
  "GBV prevention",
  "SRHR",
  "Digital skills",
  "Life skills",
  "Market linkages",
];

const MEMBER_ROLES = ["Chairperson", "Secretary", "Treasurer", "Loan officer", "Member"];

const EDUCATION_LEVELS = ["Primary", "Secondary", "VETA", "Tertiary"];

async function seedMemberLookups() {
  for (let i = 0; i < MEMBER_ROLES.length; i++) {
    const name = MEMBER_ROLES[i];
    const { error } = await supabase
      .from("member_roles")
      .upsert({ name, sort_order: i + 1, is_active: true }, { onConflict: "name" });
    if (error) console.error("role", name, error.message);
    else console.log("Role:", name);
  }
  for (let i = 0; i < EDUCATION_LEVELS.length; i++) {
    const name = EDUCATION_LEVELS[i];
    const { error } = await supabase
      .from("education_levels")
      .upsert({ name, sort_order: i + 1, is_active: true }, { onConflict: "name" });
    if (error) console.error("education", name, error.message);
    else console.log("Education:", name);
  }
}

async function seedWards() {
  for (const name of WARDS) {
    const { error } = await supabase
      .from("wards")
      .upsert({ name, district: "Dar es Salaam" }, { onConflict: "name" });
    if (error) console.error("ward", name, error.message);
    else console.log("Ward:", name);
  }
}

async function seedTrainingModules() {
  for (let i = 0; i < TRAINING_MODULES.length; i++) {
    const name = TRAINING_MODULES[i];
    const { error } = await supabase
      .from("training_modules")
      .upsert({ name, sort_order: i + 1 }, { onConflict: "name" });
    if (error) console.error("module", name, error.message);
    else console.log("Module:", name);
  }
}

async function seedGroups() {
  const { data: wards } = await supabase.from("wards").select("id, name");
  const wardMap = new Map(wards?.map((w) => [w.name, w.id]) ?? []);

  for (const g of GROUPS) {
    const wardId = wardMap.get(g.ward);
    if (!wardId) {
      console.warn("Ward not found:", g.ward);
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
        meeting_day: "Saturday",
        formed_year: 2023,
        mentor_name: "YEE Field Officer",
        loan_balance_display: `TZS ${(g.savingsNum * 0.3).toFixed(1)}M`,
        next_disbursement: "Sep 2026",
      },
      { onConflict: "slug" },
    );
    if (error) console.error("group", g.name, error.message);
    else console.log("Group:", g.name);
  }
}

async function seedDocuments() {
  const docs = seedGroupDocuments();
  for (const doc of docs) {
    const { error } = await supabase.from("documents").upsert(
      {
        id: doc.id,
        group_slug: doc.groupSlug,
        group_name: doc.groupName,
        type: doc.type,
        title: doc.title,
        file_name: doc.fileName,
        file_url: doc.fileUrl,
        mime_type: doc.mimeType,
        file_size_bytes: doc.fileSizeBytes,
        is_public: doc.isPublic,
        uploaded_at: doc.uploadedAt,
      },
      { onConflict: "id" },
    );
    if (error) console.error("doc", doc.id, error.message);
  }
  console.log(`Documents: ${docs.length} upserted`);
}

async function seedMembersAndTrainings() {
  const { data: groups } = await supabase.from("groups").select("id, slug, name, member_count");
  const { data: modules } = await supabase.from("training_modules").select("id, name");
  const moduleMap = new Map(modules?.map((m) => [m.name, m.id]) ?? []);

  if (!groups?.length) {
    console.warn("No groups found — skip members/trainings seed");
    return;
  }

  let memberTotal = 0;
  let trainingTotal = 0;

  for (const g of GROUPS) {
    const dbGroup = groups.find((row) => row.slug === slugify(g.name));
    if (!dbGroup) continue;

    const details = getGroupDetails(g);

    await supabase.from("group_members").delete().eq("group_id", dbGroup.id);

    const memberRows = details.members.map((m) => {
      const contributionNum = parseInt(m.contribution.replace(/\D/g, ""), 10) || 0;
      return {
        group_id: dbGroup.id,
        full_name: m.name,
        age: m.age,
        sex: m.sex,
        member_role: m.role,
        education: m.education,
        contribution_display: m.contribution,
        contribution_amount: contributionNum * 1000,
      };
    });

    const { error: memberError } = await supabase.from("group_members").insert(memberRows);
    if (memberError) {
      console.error("members", g.name, memberError.message);
    } else {
      memberTotal += memberRows.length;
    }

    await supabase.from("training_completions").delete().eq("group_id", dbGroup.id);

    for (const t of details.trainings) {
      const moduleId = moduleMap.get(t.name);
      if (!moduleId) continue;

      const { error } = await supabase.from("training_completions").insert({
        group_id: dbGroup.id,
        module_id: moduleId,
        members_completed: t.completed,
        completed_at: "2026-05-15",
      });
      if (!error) trainingTotal += 1;
    }
  }

  console.log(`Members: ${memberTotal} inserted across ${groups.length} groups`);
  console.log(`Training completions: ${trainingTotal} inserted`);
}

async function main() {
  console.log("Seeding YEE Portal database...\n");
  await seedWards();
  await seedTrainingModules();
  await seedMemberLookups();
  await seedGroups();
  await seedDocuments();
  await seedMembersAndTrainings();
  console.log("\nDone.");
}

main();
