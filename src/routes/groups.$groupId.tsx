import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GroupDocumentsSection } from "@/components/documents/group-documents-section";
import { fetchGroupDetail } from "@/lib/data/groups";
import { repoGetGroupDocuments } from "@/lib/documents/repository";

export const Route = createFileRoute("/groups/$groupId")({
  loader: async ({ params }) => {
    const detail = await fetchGroupDetail(params.groupId);
    if (!detail) throw notFound();
    const documents = await repoGetGroupDocuments(params.groupId);
    return { ...detail, documents };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Group not found — YEE Tanzania" }, { name: "robots", content: "noindex" }],
      };
    }
    const g = loaderData.group;
    const title = `${g.name} — ${g.ward} · YEE Tanzania`;
    const desc = `${g.name} is a ${g.focus.toLowerCase()} youth group in ${g.ward} with ${g.members} members, ${g.savings} in savings and ${g.readiness}% loan readiness.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: GroupNotFound,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center bg-background p-8 text-center">
      <div>
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <button
          onClick={reset}
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          Try again
        </button>
      </div>
    </div>
  ),
  component: GroupDetailsPage,
});

function GroupNotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-background p-8 text-center">
      <div>
        <p className="eyebrow text-clay">404</p>
        <h1 className="mt-2 font-display text-4xl">Group not found</h1>
        <p className="mt-3 text-muted-foreground">
          The group you're looking for isn't in our directory.
        </p>
        <Link
          to="/groups"
          className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream"
        >
          Back to directory
        </Link>
      </div>
    </div>
  );
}

function GroupDetailsPage() {
  const { group, members, trainings, meta, documents, related } = Route.useLoaderData();

  const women = members.filter((m) => m.sex === "F").length;
  const men = members.length - women;
  const avgAge =
    members.length > 0
      ? Math.round(members.reduce((s, m) => s + m.age, 0) / members.length)
      : 0;

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
            to="/groups"
            className="text-sm font-semibold text-cream/85 hover:text-sun transition-colors"
          >
            ← All groups
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink text-cream pb-16">
        <div className="container-page pt-8">
          <p className="eyebrow text-sun">
            {group.ward} · {group.cycle}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight max-w-3xl">
              {group.name}
              <span className="italic text-sun"> — {group.focus.toLowerCase()}.</span>
            </h1>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sun text-ink font-display text-2xl">
              {group.tier}
            </span>
          </div>

          <dl className="mt-10 grid gap-px bg-cream/20 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat k="Members" v={String(group.members)} />
            <HeroStat k="Total savings" v={group.savings} />
            <HeroStat k="Loan readiness" v={`${group.readiness}%`} />
            <HeroStat k="Repayment rate" v={group.repayment} />
          </dl>
        </div>
      </section>

      {/* Meta strip */}
      <section className="bg-secondary border-b border-border">
        <div className="container-page py-8 grid gap-6 md:grid-cols-4">
          <MetaItem k="Location" v={meta.location} />
          <MetaItem k="Established" v={meta.formed} />
          <MetaItem k="Mentor" v={meta.mentor} />
          <MetaItem k="Contact" v={meta.contact} />
        </div>
      </section>

      {/* Body */}
      <section className="bg-background py-16">
        <div className="container-page grid gap-12 lg:grid-cols-3">
          {/* Members */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="eyebrow text-clay">Members</p>
                <h2 className="mt-2 font-display text-3xl">
                  {group.members} youth ·{" "}
                  <span className="text-muted-foreground">
                    {women} women, {men} men · avg. {avgAge} yrs
                  </span>
                </h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Age</th>
                    <th className="px-5 py-3">Sex</th>
                    <th className="px-5 py-3">Education</th>
                    <th className="px-5 py-3 text-right">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-5 py-3 font-medium text-foreground">{m.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.role}</td>
                      <td className="px-5 py-3 text-muted-foreground">{m.age}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {m.sex === "F" ? "Female" : "Male"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{m.education}</td>
                      <td className="px-5 py-3 text-right font-medium">{m.contribution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <GroupDocumentsSection documents={documents} groupName={group.name} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div>
              <p className="eyebrow text-clay">Credit snapshot</p>
              <dl className="mt-3 rounded-2xl border border-border bg-card divide-y divide-border">
                <SideRow k="Credit tier" v={group.tier} />
                <SideRow k="Savings cycle" v={group.cycle} />
                <SideRow k="Current loan balance" v={meta.loanBalance} />
                <SideRow k="Next disbursement" v={meta.nextDisbursement} />
                <SideRow k="Meeting day" v={meta.meetingDay} />
              </dl>
            </div>

            <div>
              <p className="eyebrow text-clay">Trainings completed</p>
              <ul className="mt-3 space-y-3">
                {trainings.map((t) => (
                  <li
                    key={t.name}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-sun" />
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">Completed {t.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {t.completed}/{group.members}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-secondary py-16 border-t border-border">
          <div className="container-page">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow text-clay">Related groups</p>
                <h2 className="mt-2 font-display text-3xl">Similar groups nearby</h2>
              </div>
              <Link
                to="/groups"
                className="text-sm font-semibold text-ink underline decoration-sun decoration-2 underline-offset-[6px]"
              >
                Browse all →
              </Link>
            </div>
            <div className="grid gap-px bg-border rounded-2xl overflow-hidden sm:grid-cols-3">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to="/groups/$groupId"
                  params={{ groupId: g.slug }}
                  className="bg-card p-6 hover:bg-cream/40 transition-colors"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-clay">
                    {g.ward}
                  </p>
                  <h3 className="mt-2 font-display text-xl">{g.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{g.focus}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function HeroStat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-ink p-6">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cream/70">{k}</dt>
      <dd className="mt-2 font-display text-3xl text-cream">{v}</dd>
    </div>
  );
}

function MetaItem({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {k}
      </p>
      <p className="mt-1 font-medium text-foreground">{v}</p>
    </div>
  );
}

function SideRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}
