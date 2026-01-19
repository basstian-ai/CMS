import Link from "next/link";

import { AdminSignOutButton } from "@/components/admin/sign-out-button";

const navItems = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/posts", label: "Innlegg" },
  { href: "/admin/events", label: "Arrangementer" },
  { href: "/admin/sermons", label: "Taler" },
  { href: "/admin/pages", label: "Sider" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900">
        <div className="container-layout flex flex-wrap items-center justify-between gap-4 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Admin
            </p>
            <h1 className="text-2xl font-semibold">Bykirken CMS</h1>
          </div>
          <AdminSignOutButton />
        </div>
      </header>

      <div className="container-layout grid gap-8 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="space-y-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl border border-transparent px-3 py-2 text-slate-300 transition hover:border-slate-800 hover:bg-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="rounded-3xl border border-slate-900 bg-slate-900/40 p-6 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
