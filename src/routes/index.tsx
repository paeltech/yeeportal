import { createFileRoute, Link } from "@tanstack/react-router";
import heroYouth from "@/assets/hero-youth.jpg";
import story1 from "@/assets/story-1.jpg";
import story2 from "@/assets/story-2.jpg";
import story3 from "@/assets/story-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YEE — Youth Economic Empowerment in Tanzania" },
      {
        name: "description",
        content:
          "Training, savings groups and mentorship for young Tanzanian entrepreneurs across 13 wards. Implemented by Mulika Tanzania with UNFPA support.",
      },
      { property: "og:title", content: "YEE — Youth-led enterprise across Tanzania" },
      {
        property: "og:description",
        content: "126+ members. 24+ groups. 13 wards. Real livelihoods.",
      },
      { property: "og:image", content: heroYouth },
      { name: "twitter:image", content: heroYouth },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <PartnerStrip />
        <HowItWorks />
        <ImpactBand />
        <Stories />
        <Groups />
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

function Hero() {
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
          <Stat n="126+" label="Active members" />
          <Stat n="24" label="Youth groups" />
          <Stat n="13" label="Wards reached" />
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

function ImpactBand() {
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
          <ImpactStat n="126+" l="Active members" />
          <ImpactStat n="24" l="Youth groups" />
          <ImpactStat n="13" l="Wards" />
          <ImpactStat n="2024" l="Cohort year" />
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

function Stories() {
  const items = [
    {
      img: story1,
      ward: "Kinondoni Ward",
      title: "From market stall to registered shop.",
      excerpt:
        "Amina turned a kitenge side-hustle into a registered enterprise after her group's first savings cycle.",
    },
    {
      img: story2,
      ward: "Temeke Ward",
      title: "A savings group that paid for itself in six months.",
      excerpt:
        "How twelve members pooled weekly contributions to fund three new businesses in a single year.",
    },
    {
      img: story3,
      ward: "Ilala Ward",
      title: "Sparks, steel and a workshop of their own.",
      excerpt:
        "Mentorship and seed funding gave a welding cooperative its first commercial contract.",
    },
  ];
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
          <a
            href="#"
            className="text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px] hover:decoration-clay"
          >
            All stories →
          </a>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {items.map((s, i) => (
            <article key={i} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-muted">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={1024}
                  height={1280}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-clay">
                {s.ward}
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

function Groups() {
  const groups = [
    {
      name: "Tujikomboe",
      ward: "Kinondoni",
      focus: "Tailoring & kitenge",
      members: 14,
      savings: "TZS 4.2M",
      readiness: 86,
      tier: "A",
      cycle: "Cycle 3",
      repayment: "100%",
    },
    {
      name: "Mshikamano",
      ward: "Temeke",
      focus: "Urban farming",
      members: 12,
      savings: "TZS 2.8M",
      readiness: 72,
      tier: "B",
      cycle: "Cycle 2",
      repayment: "97%",
    },
    {
      name: "Nuru ya Vijana",
      ward: "Ilala",
      focus: "Metal fabrication",
      members: 9,
      savings: "TZS 3.6M",
      readiness: 78,
      tier: "B",
      cycle: "Cycle 2",
      repayment: "98%",
    },
    {
      name: "Hekima",
      ward: "Ubungo",
      focus: "Mobile services",
      members: 11,
      savings: "TZS 1.4M",
      readiness: 54,
      tier: "C",
      cycle: "Cycle 1",
      repayment: "92%",
    },
  ];

  const portfolio = {
    totalSavings: "TZS 12.0M",
    capitalDeployed: "TZS 8.4M",
    avgRepayment: "97%",
    loanReady: 18,
  };

  return (
    <section id="groups" className="bg-secondary py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-lg">
            <p className="eyebrow text-clay">Youth groups</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
              24 groups. One growing network.
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
            <PortfolioStat n={portfolio.capitalDeployed} l="Capital deployed" />
            <PortfolioStat n={portfolio.avgRepayment} l="Avg. repayment rate" />
            <PortfolioStat n={`${portfolio.loanReady}/24`} l="Loan-ready groups" />
          </dl>
        </div>

        {/* Member demographics + thematic training */}
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          {/* Demographics */}
          <div className="rounded-2xl border border-border bg-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-clay">Member demographics</p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                n = 126
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl tracking-tight leading-tight">
              Who the network reaches.
            </h3>

            <DemoBlock
              title="Age"
              rows={[
                { l: "15–19", v: 22 },
                { l: "20–24", v: 41 },
                { l: "25–29", v: 27 },
                { l: "30–35", v: 10 },
              ]}
            />
            <DemoBlock
              title="Sex"
              rows={[
                { l: "Young women", v: 58 },
                { l: "Young men", v: 41 },
                { l: "Prefer not to say", v: 1 },
              ]}
            />
            <DemoBlock
              title="Education"
              rows={[
                { l: "Primary", v: 18 },
                { l: "Secondary", v: 49 },
                { l: "VETA / TVET", v: 21 },
                { l: "Tertiary", v: 12 },
              ]}
            />
            <DemoBlock
              title="Livelihood status at intake"
              rows={[
                { l: "Unemployed", v: 47 },
                { l: "Casual / kibarua", v: 33 },
                { l: "Self-employed", v: 16 },
                { l: "In school", v: 4 },
              ]}
            />
          </div>

          {/* Thematic trainings */}
          <div className="rounded-2xl border border-border bg-card p-7 md:p-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-clay">Thematic trainings</p>
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                7 modules
              </span>
            </div>
            <h3 className="mt-3 font-display text-2xl tracking-tight leading-tight">
              What every group is trained in.
            </h3>

            <ul className="mt-6 space-y-3">
              {[
                {
                  t: "Financial literacy",
                  d: "Budgeting, saving, recordkeeping and group lending basics.",
                  c: 124,
                },
                {
                  t: "Entrepreneurship & business planning",
                  d: "Idea to plan, costing, pricing and market entry.",
                  c: 118,
                },
                {
                  t: "GBV prevention & response",
                  d: "Recognising, preventing and safely reporting gender-based violence.",
                  c: 126,
                },
                {
                  t: "Sexual & reproductive health rights",
                  d: "SRHR essentials delivered with UNFPA-aligned curriculum.",
                  c: 121,
                },
                {
                  t: "Digital & mobile-money skills",
                  d: "Smartphone basics, M-Pesa / Tigo Pesa, online safety.",
                  c: 102,
                },
                {
                  t: "Life skills & leadership",
                  d: "Communication, negotiation, group governance.",
                  c: 115,
                },
                {
                  t: "Market linkages & cooperatives",
                  d: "Registering groups, accessing buyers and value chains.",
                  c: 73,
                },
              ].map((m) => (
                <li
                  key={m.t}
                  className="flex items-start gap-4 border-t border-border pt-3 first:border-0 first:pt-0"
                >
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-sun shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-display text-base text-foreground">{m.t}</h4>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {m.c} trained
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid gap-px bg-border overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((g) => (
            <a
              key={g.name}
              href="#"
              className="bg-card p-7 flex flex-col gap-5 hover:bg-cream transition-colors"
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
            </a>
          ))}
        </div>
      </div>
    </section>
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
