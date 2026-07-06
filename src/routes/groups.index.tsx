import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { getGroups } from "@/lib/data/group-fns";

export const Route = createFileRoute("/groups/")({
  loader: async () => ({ groups: await getGroups() }),
  head: ({ loaderData }) => {
    const count = loaderData?.groups.length ?? 0;
    return {
      meta: [
        { title: "Youth Groups — YEE Tanzania" },
        {
          name: "description",
          content: `Browse ${count} YEE youth groups across Dar es Salaam. Filter by ward, focus, credit tier and savings cycle.`,
        },
        { property: "og:title", content: "YEE Youth Groups Directory" },
        {
          property: "og:description",
          content: "Filter and explore youth-led enterprise groups across Tanzania.",
        },
      ],
    };
  },
  component: GroupsPage,
});

const uniq = <T,>(a: T[]) => Array.from(new Set(a)).sort();

function GroupsPage() {
  const { groups } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("All");
  const [focus, setFocus] = useState("All");
  const [tier, setTier] = useState("All");
  const [cycle, setCycle] = useState("All");
  const [sort, setSort] = useState<"readiness" | "savings" | "name" | "members">("readiness");

  const wards = useMemo(() => uniq(groups.map((g) => g.ward)), [groups]);
  const focuses = useMemo(() => uniq(groups.map((g) => g.focus)), [groups]);
  const cycles = useMemo(() => uniq(groups.map((g) => g.cycle)), [groups]);

  const filtered = useMemo(() => {
    const list = groups.filter((g) => {
      if (ward !== "All" && g.ward !== ward) return false;
      if (focus !== "All" && g.focus !== focus) return false;
      if (tier !== "All" && g.tier !== tier) return false;
      if (cycle !== "All" && g.cycle !== cycle) return false;
      if (q && !`${g.name} ${g.ward} ${g.focus}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "members") return b.members - a.members;
      if (sort === "savings") return b.savingsNum - a.savingsNum;
      return b.readiness - a.readiness;
    });
  }, [groups, q, ward, focus, tier, cycle, sort]);

  const reset = () => {
    setQ("");
    setWard("All");
    setFocus("All");
    setTier("All");
    setCycle("All");
    setSort("readiness");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-ink text-cream">
        <div className="container-page flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-sun text-ink font-display font-bold">
              Y
            </span>
            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-cream/80">
                Youth Economic
              </span>
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-cream/80">
                Empowerment
              </span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm font-semibold text-cream/85 hover:text-sun transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Title */}
      <section className="bg-ink text-cream pb-16">
        <div className="container-page pt-8">
          <p className="eyebrow text-sun">Directory</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            All youth groups <span className="italic text-sun">across Tanzania.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-cream/75 leading-relaxed">
            Filter by ward, enterprise focus, credit tier or savings cycle to explore the{" "}
            {groups.length} groups currently active in the YEE network.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-secondary py-10 border-b border-border">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <Label>Search</Label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Group, ward or focus"
                className="mt-2 w-full h-11 rounded-full border border-border bg-card px-5 text-sm focus:outline-none focus:border-ink"
              />
            </div>
            <FilterSelect
              label="Ward"
              value={ward}
              onChange={setWard}
              options={wards}
              span="md:col-span-2"
            />
            <FilterSelect
              label="Focus"
              value={focus}
              onChange={setFocus}
              options={focuses}
              span="md:col-span-2"
            />
            <FilterSelect
              label="Tier"
              value={tier}
              onChange={setTier}
              options={["A", "B", "C"]}
              span="md:col-span-2"
            />
            <FilterSelect
              label="Cycle"
              value={cycle}
              onChange={setCycle}
              options={cycles}
              span="md:col-span-2"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              {groups.length} groups
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-9 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:border-ink"
              >
                <option value="readiness">Loan readiness</option>
                <option value="savings">Total savings</option>
                <option value="members">Members</option>
                <option value="name">Name (A–Z)</option>
              </select>
              <button
                onClick={reset}
                className="text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px] hover:decoration-clay"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-secondary pb-24 pt-10">
        <div className="container-page">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <p className="font-display text-2xl">No groups match those filters.</p>
              <button
                onClick={reset}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink-soft"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-px bg-border overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((g) => (
                <Link
                  key={g.slug}
                  to="/groups/$groupId"
                  params={{ groupId: g.slug }}
                  className="bg-card p-7 flex flex-col gap-5 group hover:bg-cream/40 transition-colors focus:outline-none focus:ring-2 focus:ring-sun"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-2xl leading-tight group-hover:underline decoration-sun decoration-2 underline-offset-[6px]">
                        {g.name}
                      </h3>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">
                        {g.ward} · {g.cycle}
                      </p>
                    </div>
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full bg-ink text-cream font-display text-sm"
                      title={`Credit tier ${g.tier}`}
                    >
                      {g.tier}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Loan readiness
                      </span>
                      <span className="font-display text-lg text-foreground">{g.readiness}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div className="h-full bg-sun" style={{ width: `${g.readiness}%` }} />
                    </div>
                  </div>

                  <div className="mt-auto space-y-1.5 text-sm">
                    <Row k="Focus" v={g.focus} />
                    <Row k="Members" v={String(g.members)} />
                    <Row k="Savings" v={g.savings} />
                    <Row k="Repayment" v={g.repayment} />
                  </div>

                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                    View details →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  span: string;
}) {
  return (
    <div className={span}>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full h-11 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:border-ink"
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{k}</span>
      <span className="text-foreground font-medium">{v}</span>
    </div>
  );
}
