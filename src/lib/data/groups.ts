import { GROUPS, slugify, type Group, type Member, getGroupDetails } from "@/lib/groups-data";
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
};

export type ProgrammeStats = {
  totalGroups: number;
  totalMembers: number;
  totalSavingsDisplay: string;
  avgReadiness: number;
  wardCount: number;
};

function mapStaticGroup(g: Group): GroupRecord {
  return { ...g, slug: slugify(g.name) };
}

function formatSavings(total: number): string {
  if (total >= 1_000_000) return `TZS ${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `TZS ${Math.round(total / 1_000)}K`;
  return `TZS ${total}`;
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

export async function fetchAllGroups(): Promise<GroupRecord[]> {
  const admin = createSupabaseAdminClient();
  if (isSupabaseConfigured() && admin) {
    const { data, error } = await admin
      .from("groups")
      .select("*, wards(name)")
      .eq("status", "active")
      .order("name");
    if (!error && data?.length) {
      return data.map((row) => mapDbGroup(row, (row.wards as { name: string })?.name ?? ""));
    }
  }
  return GROUPS.map(mapStaticGroup);
}

export async function fetchGroupBySlug(slug: string): Promise<GroupRecord | null> {
  const admin = createSupabaseAdminClient();
  if (isSupabaseConfigured() && admin) {
    const { data, error } = await admin
      .from("groups")
      .select("*, wards(name)")
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (!error && data) {
      return mapDbGroup(data, (data.wards as { name: string })?.name ?? "");
    }
  }
  const g = GROUPS.find((x) => slugify(x.name) === slug);
  return g ? mapStaticGroup(g) : null;
}

export async function fetchGroupDetail(slug: string): Promise<GroupDetail | null> {
  const group = await fetchGroupBySlug(slug);
  if (!group) return null;

  const admin = createSupabaseAdminClient();
  if (isSupabaseConfigured() && admin && group.id) {
    const [membersRes, trainingsRes, groupRes] = await Promise.all([
      admin.from("group_members").select("*").eq("group_id", group.id).order("full_name"),
      admin
        .from("training_completions")
        .select("*, training_modules(name)")
        .eq("group_id", group.id),
      admin.from("groups").select("*").eq("id", group.id).single(),
    ]);

    if (!membersRes.error && membersRes.data?.length) {
      const gRow = groupRes.data;
      const members: Member[] = membersRes.data.map((m) => ({
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

      return {
        group,
        members,
        trainings,
        meta: {
          formed: `${gRow?.meeting_day ?? "Weekly"} · Est. ${gRow?.formed_year ?? 2024}`,
          meetingDay: gRow?.meeting_day ?? "Weekly",
          mentor: gRow?.mentor_name ?? "YEE Field Officer",
          location: `${group.ward}, Dar es Salaam`,
          nextDisbursement: gRow?.next_disbursement ?? "TBD",
          loanBalance: gRow?.loan_balance_display ?? "TZS 0",
          contact: gRow?.contact_phone ?? "Contact via YEE office",
        },
      };
    }
  }

  const details = getGroupDetails(group);
  return { group, ...details };
}

export async function fetchProgrammeStats(): Promise<ProgrammeStats> {
  const groups = await fetchAllGroups();
  const totalMembers = groups.reduce((s, g) => s + g.members, 0);
  const totalSavings = groups.reduce((s, g) => s + g.savingsNum, 0);
  const avgReadiness = groups.length
    ? Math.round(groups.reduce((s, g) => s + g.readiness, 0) / groups.length)
    : 0;
  const wards = new Set(groups.map((g) => g.ward));

  return {
    totalGroups: groups.length,
    totalMembers,
    totalSavingsDisplay: `TZS ${totalSavings.toFixed(1)}M`,
    avgReadiness,
    wardCount: wards.size,
  };
}
