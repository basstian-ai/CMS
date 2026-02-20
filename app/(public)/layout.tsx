import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-stone-900">
      <header className="border-b border-[#e6ddcf] bg-[#fffaf3]">
        <div className="container-layout flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="sr-only">Bykirken</span>
            <Image
              src="https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png"
              alt="Bykirken"
              width={180}
              height={56}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-stone-600 lg:flex">

            <Link href="/nyheter" className="transition hover:text-stone-900">
              Nyheter
            </Link>
            <Link href="/kalender" className="transition hover:text-stone-900">
              Kalender
            </Link>
            <Link href="/podcast" className="transition hover:text-stone-900">
              Podcast
            </Link>
            <Link href="/kontakt" className="transition hover:text-stone-900">
              Kontakt
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Suspense
              fallback={
                <div className="h-7 w-[72px] rounded-full bg-[#efe5d8]" aria-hidden />
              }
            >
              <LanguageToggle />
            </Suspense>
            <MobileMenu />
            <Button variant="secondary" className="hidden lg:inline-flex">
              Gi
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#e6ddcf] bg-[#fffaf3]">
        <div className="container-layout flex flex-col gap-4 py-8 text-sm text-stone-600 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3">
              <Image
                src="https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png"
                alt="Bykirken"
                width={140}
                height={44}
                className="h-8 w-auto"
              />
            </div>
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
