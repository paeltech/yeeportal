import { createFileRoute, Link } from "@tanstack/react-router";
import heroYouth from "@/assets/hero-youth.jpg";
import { getHomePageData, getPublishedStories } from "@/lib/data/group-fns";
import type { GroupRecord, HomePageData } from "@/lib/data/groups";
import type { Story } from "@/lib/data/stories";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [home, stories] = await Promise.all([getHomePageData(), getPublishedStories()]);
    return { home, stories };
  },
  head: ({ loaderData }) => {
    const stats = loaderData?.home.stats;
    const members = stats?.totalMembers ?? 0;
    const groups = stats?.totalGroups ?? 0;
    const wards = stats?.wardCount ?? 0;
    return {
      meta: [
        { title: "YEE — Youth Economic Empowerment in Tanzania" },
        {
          name: "description",
          content:
            "Training, savings groups and mentorship for young Tanzanian entrepreneurs across Dar es Salaam wards. Implemented by Mulika Tanzania with UNFPA support.",
        },
        { property: "og:title", content: "YEE — Youth-led enterprise across Tanzania" },
        {
          property: "og:description",
          content: `${members} members · ${groups} groups · ${wards} wards · Real livelihoods.`,
        },
        { property: "og:image", content: heroYouth },
        { name: "twitter:image", content: heroYouth },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { home, stories } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero stats={home.stats} />
        <PartnerStrip />
        <HowItWorks />
        <ImpactBand stats={home.stats} />
        <Stories stories={stories} />
        <Groups home={home} />
        <JoinCTA />
      </main>
      <Footer />
    </div>
  );
}

/* ----------------------------- HEADER ----------------------------- */

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="container-page flex items-center justify-between py-6">
        <a href="#" className="flex items-center gap-2.5 text-cream">
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
        </a>
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-cream/85">
          <a href="#program" className="hover:text-sun transition-colors">
            The Program
          </a>
          <a href="#stories" className="hover:text-sun transition-colors">
            Stories
          </a>
          <a href="#groups" className="hover:text-sun transition-colors">
            Groups
          </a>
          <a href="#join" className="hover:text-sun transition-colors">
            Partner
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-xs font-semibold tracking-widest uppercase text-cream/70 hover:text-sun">
            SW / EN
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-ink hover:bg-sun-deep transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------ HERO ------------------------------ */

function Hero({ stats }: { stats: HomePageData["stats"] }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-cream">
      <img
        src={heroYouth}
        alt="Young Tanzanian entrepreneurs taking notes during a YEE training session"
        width={1600}
        height={1200}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.03 250 / 0.55) 0%, oklch(0.18 0.03 250 / 0.75) 55%, oklch(0.18 0.03 250 / 0.95) 100%)",
        }}
      />
      <div className="relative container-page pt-36 pb-28 md:pt-44 md:pb-40">
        <div className="max-w-3xl">
          <p className="eyebrow text-sun mb-6">
            <span className="inline-block h-px w-8 align-middle bg-sun mr-3" />
            Mulika Tanzania × UNFPA
          </p>
          <h1 className="headline-xl">
            Youth-led enterprise,
            <br />
            growing across <span className="italic font-normal text-sun">Tanzania.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-cream/80">
            YEE equips young people with the training, savings groups and mentorship to build
            sustainable livelihoods — and the financial independence that follows.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#groups"
              className="inline-flex items-center gap-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold text-ink hover:bg-sun-deep transition-colors"
            >
              Find a group near you
              <span aria-hidden>→</span>
            </a>
            <a
              href="#join"
              className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-7 py-3.5 text-sm font-semibold text-cream hover:border-sun hover:text-sun transition-colors"
            >
              Partner with us
            </a>
          </div>
        </div>

        {/* impact ticker pinned bottom of hero */}
        <div className="mt-20 grid grid-cols-3 max-w-2xl gap-x-10 gap-y-2 border-t border-cream/15 pt-8">
          <Stat n={stats.totalMembers.toLocaleString()} label="Active members" />
          <Stat n={String(stats.totalGroups)} label="Youth groups" />
          <Stat n={String(stats.wardCount)} label="Wards reached" />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl text-cream">{n}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/60">
        {label}
      </div>
    </div>
  );
}

/* -------------------------- PARTNER STRIP -------------------------- */

function PartnerStrip() {
  return (
    <section className="border-b border-border bg-background">
      <div className="container-page flex flex-wrap items-center justify-between gap-6 py-6">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Implemented with
        </span>
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 text-ink/80">
          <span className="font-display text-xl">Mulika Tanzania</span>
          <span className="h-4 w-px bg-border" />
          <span className="font-display text-xl">UNFPA</span>
          <span className="h-4 w-px bg-border" />
          <span className="text-sm tracking-wide">Local Government Authorities</span>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- HOW IT WORKS --------------------------- */

function HowItWorks() {
  const steps = [
    {
      n: "01",
      t: "Train",
      d: "Structured curriculum in entrepreneurship, financial literacy and digital skills — delivered locally by certified mentors.",
    },
    {
      n: "02",
      t: "Form a group",
      d: "Members organise into registered youth groups, opening access to collective savings, lending and shared enterprise.",
    },
    {
      n: "03",
      t: "Grow an enterprise",
      d: "Groups access seed capital, ongoing mentorship and links to markets — turning a plan into a living business.",
    },
  ];
  return (
    <section id="program" className="relative bg-background py-24 md:py-32">
      <div className="container-page grid gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow text-clay">The Program</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            A clear path from idea to income.
          </h2>
          <p className="mt-6 max-w-sm text-muted-foreground leading-relaxed">
            Every YEE participant moves through the same three stages — designed so that progress is
            visible, measurable and locally owned.
          </p>
        </div>
        <ol className="md:col-span-8 grid gap-px bg-border md:grid-cols-3 overflow-hidden rounded-2xl">
          {steps.map((s) => (
            <li key={s.n} className="bg-card p-8 flex flex-col gap-4">
              <span className="font-display text-sm tracking-widest text-clay">{s.n}</span>
              <h3 className="font-display text-2xl text-foreground">{s.t}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------- IMPACT BAND --------------------------- */

function ImpactBand({ stats }: { stats: HomePageData["stats"] }) {
  return (
    <section className="bg-ink text-cream py-24 md:py-28">
      <div className="container-page grid gap-12 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <p className="eyebrow text-sun">Impact to date</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            Real numbers,
            <br />
            <span className="italic text-sun">real wards.</span>
          </h2>
        </div>
        <dl className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-6">
          <ImpactStat n={stats.totalMembers.toLocaleString()} l="Active members" />
          <ImpactStat n={String(stats.totalGroups)} l="Youth groups" />
          <ImpactStat n={String(stats.wardCount)} l="Wards" />
          <ImpactStat n={stats.cohortYear ? String(stats.cohortYear) : "—"} l="Cohort year" />
        </dl>
      </div>
    </section>
  );
}

function ImpactStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <dt className="font-display text-5xl md:text-6xl text-cream leading-none">{n}</dt>
      <dd className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/60">
        {l}
      </dd>
    </div>
  );
}

/* ------------------------------ STORIES ------------------------------ */

function Stories({ stories }: { stories: Story[] }) {
  if (stories.length === 0) return null;

  return (
    <section id="stories" className="bg-background py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <p className="eyebrow text-clay">Stories from the field</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
              The work, in the words of the people doing it.
            </h2>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {stories.map((s) => (
            <article key={s.id} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-muted">
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                {s.wardLabel}
              </p>
              <h3 className="mt-3 font-display text-2xl leading-snug text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ GROUPS ------------------------------ */

function Groups({ home }: { home: HomePageData }) {
  const { stats, portfolio, demographics, trainings, featuredGroups } = home;

  return (
    <section id="groups" className="bg-secondary py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-lg">
            <p className="eyebrow text-clay">Youth groups</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
              {stats.totalGroups} groups. One growing network.
            </h2>
          </div>
          <Link
            to="/groups"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-ink-soft"
          >
            See all groups →
          </Link>
        </div>

        {/* Credit portfolio readiness summary */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-7 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-clay">Credit portfolio readiness</p>
              <h3 className="mt-3 font-display text-2xl md:text-3xl tracking-tight leading-tight max-w-md">
                A transparent view of group savings, lending capacity and repayment health.
              </h3>
            </div>
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              Updated weekly
            </span>
          </div>
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-6 border-t border-border pt-8">
            <PortfolioStat n={portfolio.totalSavings} l="Total group savings" />
            <PortfolioStat n={portfolio.capitalDeployed} l="Savings recorded" />
            <PortfolioStat n={portfolio.avgRepayment} l="Avg. repayment rate" />
            <PortfolioStat
              n={`${portfolio.loanReady}/${portfolio.totalGroups}`}
              l="Loan-ready groups"
            />
          </dl>
        </div>

        {/* Member demographics + thematic training */}
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          {/* Demographics */}
          <div className="rounded-2xl border border-border bg-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-clay">Member demographics</p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                n = {demographics.totalMembers}
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl tracking-tight leading-tight">
              Who the network reaches.
            </h3>

            {demographics.totalMembers > 0 ? (
              <>
                <DemoBlock title="Age" rows={demographics.age} />
                <DemoBlock title="Sex" rows={demographics.sex} />
                <DemoBlock title="Education" rows={demographics.education} />
              </>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">No member records yet.</p>
            )}
          </div>

          {/* Thematic trainings */}
          <div className="rounded-2xl border border-border bg-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-clay">Thematic trainings</p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {trainings.length} modules
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl tracking-tight leading-tight">
              What every group is trained in.
            </h3>

            <ul className="mt-6 space-y-3">
              {trainings.map((m) => (
                <li
                  key={m.name}
                  className="flex items-start gap-4 border-t border-border pt-3 first:border-0 first:pt-0"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-sun shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-base text-foreground">{m.name}</h4>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {m.trained} trained
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {featuredGroups.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            No active groups yet.
          </div>
        ) : (
          <div className="grid gap-px bg-border overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
            {featuredGroups.map((g) => (
              <GroupCard key={g.slug} group={g} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GroupCard({ group: g }: { group: GroupRecord }) {
  return (
    <Link
      to="/groups/$groupId"
      params={{ groupId: g.slug }}
      className="bg-card p-7 flex flex-col gap-5 hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-sun"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-display text-2xl leading-tight">{g.name}</h3>
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
        <div className="flex justify-between text-muted-foreground">
          <span>Ward</span>
          <span className="text-foreground font-medium">{g.ward}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Focus</span>
          <span className="text-foreground font-medium">{g.focus}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Members</span>
          <span className="text-foreground font-medium">{g.members}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Savings</span>
          <span className="text-foreground font-medium">{g.savings}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Repayment</span>
          <span className="text-foreground font-medium">{g.repayment}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Stage</span>
          <span className="text-foreground font-medium">{g.cycle}</span>
        </div>
      </div>
    </Link>
  );
}

function DemoBlock({ title, rows }: { title: string; rows: { l: string; v: number }[] }) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between">
        <h4 className="font-display text-base text-foreground">{title}</h4>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          % of members
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.l} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3">
            <span className="text-sm text-muted-foreground">{r.l}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-border">
              <span className="block h-full bg-ink" style={{ width: `${r.v}%` }} />
            </span>
            <span className="text-sm font-medium text-foreground text-right">{r.v}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortfolioStat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <dt className="font-display text-3xl md:text-4xl text-foreground leading-none">{n}</dt>
      <dd className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {l}
      </dd>
    </div>
  );
}

/* ----------------------------- JOIN CTA ----------------------------- */

function JoinCTA() {
  return (
    <section id="join" className="bg-sun text-ink">
      <div className="container-page grid gap-10 py-20 md:py-24 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <p className="eyebrow text-ink/70">Get involved</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl leading-[1.05] tracking-tight">
            Join a group, mentor a cohort, or fund the next ward.
          </h2>
        </div>
        <div className="md:col-span-5 flex flex-col gap-3 sm:flex-row md:justify-end">
          <Link
            to="/apply"
            className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream hover:bg-ink-soft"
          >
            Join a group
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full border border-ink/40 px-7 py-3.5 text-sm font-semibold text-ink hover:bg-ink hover:text-cream transition-colors"
          >
            Partner with YEE
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FOOTER ------------------------------ */

function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-sm bg-sun text-ink font-display font-bold">
              Y
            </span>
            <span className="font-display text-xl">Youth Economic Empowerment</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">
            A Mulika Tanzania programme supported by UNFPA Tanzania. Building young entrepreneurs
            across the country, one ward at a time.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50 mb-4">
            Program
          </p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>
              <a href="#program" className="hover:text-sun">
                How it works
              </a>
            </li>
            <li>
              <a href="#groups" className="hover:text-sun">
                Groups
              </a>
            </li>
            <li>
              <a href="#stories" className="hover:text-sun">
                Stories
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50 mb-4">
            Engage
          </p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>
              <a href="#join" className="hover:text-sun">
                Partner
              </a>
            </li>
            <li>
              <a href="#join" className="hover:text-sun">
                Mentor
              </a>
            </li>
            <li>
              <a href="#join" className="hover:text-sun">
                Donate
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/50 mb-4">
            Contact
          </p>
          <ul className="space-y-2 text-sm text-cream/80">
            <li>Dar es Salaam, Tanzania</li>
            <li>
              <a href="mailto:hello@yee.or.tz" className="hover:text-sun">
                hello@yee.or.tz
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-cream/50">
          <span>© {new Date().getFullYear()} YEE — Mulika Tanzania.</span>
          <span>Implemented with support from UNFPA Tanzania.</span>
        </div>
      </div>
    </footer>
  );
}
