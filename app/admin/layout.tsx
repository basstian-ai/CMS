import type { PropsWithChildren } from "react";

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
          <h1 className="text-2xl font-semibold">Bykirken CMS</h1>
        </header>
        <main className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
