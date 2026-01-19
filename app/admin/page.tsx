import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const cards = [
  {
    title: "Innlegg",
    description: "Nyheter, oppdateringer og artikler.",
    href: "/admin/posts",
    key: "posts",
  },
  {
    title: "Arrangementer",
    description: "Kalenderinnhold som møter og gudstjenester.",
    href: "/admin/events",
    key: "events",
  },
  {
    title: "Taler",
    description: "Podcast og talearkiv.",
    href: "/admin/sermons",
    key: "sermons",
  },
  {
    title: "Sider",
    description: "Statiske infosider og landingssider.",
    href: "/admin/pages",
    key: "pages",
  },
];

async function fetchCounts() {
  const supabase = createSupabaseServerClient();

  const [posts, events, sermons, pages] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("sermons").select("id", { count: "exact", head: true }),
    supabase.from("pages").select("id", { count: "exact", head: true }),
  ]);

  return {
    posts: posts.count ?? 0,
    events: events.count ?? 0,
    sermons: sermons.count ?? 0,
    pages: pages.count ?? 0,
  };
}

export default async function AdminPage() {
  const counts = await fetchCounts();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Adminoversikt
        </p>
        <h2 className="text-2xl font-semibold text-slate-100">
          Velkommen tilbake
        </h2>
        <p className="text-sm text-slate-300">
          Administrer innholdet ditt og opprett nye oppføringer direkte fra
          CMS-et.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-700 hover:bg-slate-950"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">
                {card.title}
              </h3>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                {counts[card.key as keyof typeof counts]}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
