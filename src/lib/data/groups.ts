import { slugify, type Group, type Member } from "@/lib/groups-data";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type GroupRecord = Group & {
  id?: string;
  slug: string;
};

export type GroupDetail = {
  group: GroupRecord;
  members: Member[];
  trainings: { name: string; completed: number; date: string }[];
  meta: {
    formed: string;
    meetingDay: string;
    mentor: string;
    location: string;
    nextDisbursement: string;
    loanBalance: string;
    contact: string;
  };
  related: GroupRecord[];
};

export type ProgrammeStats = {
  totalGroups: number;
  totalMembers: number;
  totalSavingsDisplay: string;
  avgReadiness: number;
  wardCount: number;
  cohortYear: number | null;
};

export type PortfolioStats = {
  totalSavings: string;
  capitalDeployed: string;
  avgRepayment: string;
  loanReady: number;
  totalGroups: number;
};

export type DemographicRow = { l: string; v: number };

export type MemberDemographics = {
  totalMembers: number;
  age: DemographicRow[];
  sex: DemographicRow[];
  education: DemographicRow[];
};

export type TrainingModuleStat = {
  name: string;
  description: string;
  trained: number;
};

export type HomePageData = {
  stats: ProgrammeStats;
  portfolio: PortfolioStats;
  demographics: MemberDemographics;
  trainings: TrainingModuleStat[];
  featuredGroups: GroupRecord[];
};

const TRAINING_DESCRIPTIONS: Record<string, string> = {
  "Financial literacy": "Budgeting, saving, recordkeeping and group lending basics.",
  Entrepreneurship: "Idea to plan, costing, pricing and market entry.",
  "GBV prevention": "Recognising, preventing and safely reporting gender-based violence.",
  SRHR: "SRHR essentials delivered with UNFPA-aligned curriculum.",
  "Digital skills": "Smartphone basics, M-Pesa / Tigo Pesa, online safety.",
  "Life skills": "Communication, negotiation, group governance.",
  "Market linkages": "Registering groups, accessing buyers and value chains.",
};

const LOAN_READY_THRESHOLD = 70;

function admin() {
  const client = createSupabaseAdminClient();
  if (!isSupabaseConfigured() || !client) {
    throw new Error("Database unavailable");
  }
  return client;
}

function formatSavings(total: number): string {
  if (total >= 1_000_000) return `TZS ${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `TZS ${Math.round(total / 1_000)}K`;
  return `TZS ${total}`;
}

function parseRepaymentRate(rate: string): number {
  const n = parseFloat(rate.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function mapDbGroup(row: Record<string, unknown>, wardName: string): GroupRecord {
  const savingsTotal = Number(row.savings_total ?? 0);
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    ward: wardName,
    focus: row.focus as string,
    members: row.member_count as number,
    savings: (row.savings_display as string) || formatSavings(savingsTotal),
    savingsNum: savingsTotal / 1_000_000,
    readiness: row.readiness_score as number,
    tier: row.tier as Group["tier"],
    cycle: row.cycle_label as string,
    repayment: row.repayment_rate as string,
  };
}

function buildGroupMeta(
  group: GroupRecord,
  gRow: Record<string, unknown> | null,
): GroupDetail["meta"] {
  const meetingDay = (gRow?.meeting_day as string) ?? "Weekly";
  const formedYear = (gRow?.formed_year as number) ?? null;
  return {
    formed: formedYear ? `${meetingDay} · Est. ${formedYear}` : meetingDay,
    meetingDay,
    mentor: (gRow?.mentor_name as string) ?? "YEE Field Officer",
    location: `${group.ward}, Dar es Salaam`,
    nextDisbursement: (gRow?.next_disbursement as string) ?? "TBD",
    loanBalance: (gRow?.loan_balance_display as string) ?? "TZS 0",
    contact: (gRow?.contact_phone as string) ?? "Contact via YEE office",
  };
}

export async function fetchAllGroups(): Promise<GroupRecord[]> {
  const db = admin();
  const { data, error } = await db
    .from("groups")
    .select("*, wards(name)")
    .eq("status", "active")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapDbGroup(row, (row.wards as { name: string })?.name ?? ""));
}

export async function fetchGroupBySlug(slug: string): Promise<GroupRecord | null> {
  const db = admin();
  const { data, error } = await db
    .from("groups")
    .select("*, wards(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapDbGroup(data, (data.wards as { name: string })?.name ?? "");
}

export async function fetchRelatedGroups(
  slug: string,
  ward: string,
  focus: string,
  limit = 3,
): Promise<GroupRecord[]> {
  const groups = await fetchAllGroups();
  return groups
    .filter((g) => g.slug !== slug && (g.ward === ward || g.focus === focus))
    .slice(0, limit);
}

export async function fetchGroupDetail(slug: string): Promise<GroupDetail | null> {
  const group = await fetchGroupBySlug(slug);
  if (!group?.id) return null;

  const db = admin();
  const [membersRes, trainingsRes, groupRes] = await Promise.all([
    db.from("group_members").select("*").eq("group_id", group.id).order("full_name"),
    db.from("training_completions").select("*, training_modules(name)").eq("group_id", group.id),
    db.from("groups").select("*").eq("id", group.id).single(),
  ]);

  if (membersRes.error) throw new Error(membersRes.error.message);
  if (trainingsRes.error) throw new Error(trainingsRes.error.message);
  if (groupRes.error) throw new Error(groupRes.error.message);

  const members: Member[] = (membersRes.data ?? []).map((m) => ({
    name: m.full_name,
    age: m.age,
    sex: m.sex as "F" | "M",
    role: m.member_role,
    education: m.education,
    contribution: m.contribution_display,
  }));

  const trainings = (trainingsRes.data ?? []).map((t) => ({
    name: (t.training_modules as { name: string })?.name ?? "Training",
    completed: t.members_completed,
    date: new Date(t.completed_at).toLocaleDateString("en-GB", {
      month: "short",
      year: "numeric",
    }),
  }));

  const related = await fetchRelatedGroups(group.slug, group.ward, group.focus);

  return {
    group,
    members,
    trainings,
    meta: buildGroupMeta(group, groupRes.data),
    related,
  };
}

export async function fetchProgrammeStats(): Promise<ProgrammeStats> {
  const db = admin();
  const { data: groups, error } = await db
    .from("groups")
    .select("member_count, savings_total, readiness_score, formed_year, ward_id, wards(name)")
    .eq("status", "active");
  if (error) throw new Error(error.message);

  const rows = groups ?? [];
  const totalMembers = rows.reduce((s, g) => s + (g.member_count ?? 0), 0);
  const totalSavings = rows.reduce((s, g) => s + Number(g.savings_total ?? 0), 0);
  const avgReadiness = rows.length
    ? Math.round(rows.reduce((s, g) => s + (g.readiness_score ?? 0), 0) / rows.length)
    : 0;
  const wards = new Set(
    rows.map((g) => (g.wards as { name: string } | null)?.name).filter(Boolean),
  );
  const years = rows.map((g) => g.formed_year).filter((y): y is number => y != null);

  return {
    totalGroups: rows.length,
    totalMembers,
    totalSavingsDisplay: formatSavings(totalSavings),
    avgReadiness,
    wardCount: wards.size,
    cohortYear: years.length ? Math.min(...years) : null,
  };
}

export async function fetchPortfolioStats(): Promise<PortfolioStats> {
  const db = admin();
  const [groupsRes, savingsRes] = await Promise.all([
    db
      .from("groups")
      .select("savings_total, readiness_score, repayment_rate")
      .eq("status", "active"),
    db.from("savings_records").select("amount"),
  ]);
  if (groupsRes.error) throw new Error(groupsRes.error.message);
  if (savingsRes.error) throw new Error(savingsRes.error.message);

  const groups = groupsRes.data ?? [];
  const totalSavings = groups.reduce((s, g) => s + Number(g.savings_total ?? 0), 0);
  const capitalDeployed = (savingsRes.data ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const repaymentRates = groups.map((g) => parseRepaymentRate(g.repayment_rate ?? "0"));
  const avgRepayment = repaymentRates.length
    ? Math.round(repaymentRates.reduce((a, b) => a + b, 0) / repaymentRates.length)
    : 0;
  const loanReady = groups.filter((g) => (g.readiness_score ?? 0) >= LOAN_READY_THRESHOLD).length;

  return {
    totalSavings: formatSavings(totalSavings),
    capitalDeployed: formatSavings(capitalDeployed),
    avgRepayment: `${avgRepayment}%`,
    loanReady,
    totalGroups: groups.length,
  };
}

export async function fetchMemberDemographics(): Promise<MemberDemographics> {
  const db = admin();
  const { data, error } = await db.from("group_members").select("age, sex, education");
  if (error) throw new Error(error.message);

  const members = data ?? [];
  const total = members.length;
  const ageBuckets = [
    { l: "15–19", min: 15, max: 19 },
    { l: "20–24", min: 20, max: 24 },
    { l: "25–29", min: 25, max: 29 },
    { l: "30–35", min: 30, max: 35 },
  ];
  const age = ageBuckets.map(({ l, min, max }) => ({
    l,
    v: pct(members.filter((m) => m.age >= min && m.age <= max).length, total),
  }));

  const women = members.filter((m) => m.sex === "F").length;
  const men = members.filter((m) => m.sex === "M").length;
  const sex = [
    { l: "Young women", v: pct(women, total) },
    { l: "Young men", v: pct(men, total) },
  ];

  const educationLevels = [...new Set(members.map((m) => m.education))].sort();
  const education = educationLevels.map((level) => ({
    l: level,
    v: pct(members.filter((m) => m.education === level).length, total),
  }));

  return { totalMembers: total, age, sex, education };
}

export async function fetchTrainingModuleStats(): Promise<TrainingModuleStat[]> {
  const db = admin();
  const { data: modules, error: modErr } = await db
    .from("training_modules")
    .select("id, name")
    .order("sort_order");
  if (modErr) throw new Error(modErr.message);

  const { data: completions, error: compErr } = await db
    .from("training_completions")
    .select("module_id, members_completed");
  if (compErr) throw new Error(compErr.message);

  const trainedByModule = new Map<string, number>();
  for (const row of completions ?? []) {
    const prev = trainedByModule.get(row.module_id) ?? 0;
    trainedByModule.set(row.module_id, prev + (row.members_completed ?? 0));
  }

  return (modules ?? []).map((m) => ({
    name: m.name,
    description: TRAINING_DESCRIPTIONS[m.name] ?? "YEE programme training module.",
    trained: trainedByModule.get(m.id) ?? 0,
  }));
}

export async function fetchHomePageData(): Promise<HomePageData> {
  const [stats, portfolio, demographics, trainings, groups] = await Promise.all([
    fetchProgrammeStats(),
    fetchPortfolioStats(),
    fetchMemberDemographics(),
    fetchTrainingModuleStats(),
    fetchAllGroups(),
  ]);

  const featuredGroups = [...groups].sort((a, b) => b.readiness - a.readiness).slice(0, 4);

  return { stats, portfolio, demographics, trainings, featuredGroups };
}

export async function fetchApplyFormOptions(): Promise<{ wards: string[]; focusAreas: string[] }> {
  const db = admin();
  const [wardsRes, groupsRes] = await Promise.all([
    db.from("wards").select("name").order("name"),
    db.from("groups").select("focus").eq("status", "active"),
  ]);
  if (wardsRes.error) throw new Error(wardsRes.error.message);
  if (groupsRes.error) throw new Error(groupsRes.error.message);

  const wards = (wardsRes.data ?? []).map((w) => w.name);
  const focusAreas = [...new Set((groupsRes.data ?? []).map((g) => g.focus))].sort();

  return { wards, focusAreas };
}

export { slugify };
