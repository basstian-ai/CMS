import type { PropsWithChildren } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container-layout flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Bykirken
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">

            <Link href="/nyheter" className="transition hover:text-slate-900">
              Nyheter
            </Link>
            <Link href="/kalender" className="transition hover:text-slate-900">
              Kalender
            </Link>
            <Link href="/podcast" className="transition hover:text-slate-900">
              Podcast
            </Link>
            <Link href="/kontakt" className="transition hover:text-slate-900">
              Kontakt
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button variant="secondary" className="hidden md:inline-flex">
              Gi
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="container-layout flex flex-col gap-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <div>
            <strong className="text-slate-900">Bykirken</strong>
            <p>Storgata 1, 0001 Oslo · hello@bykirken.no</p>
          </div>
          <div className="flex items-center gap-4">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>Spotify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
