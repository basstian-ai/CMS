import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { PageAutoTranslator } from "@/components/ui/page-auto-translator";

type SocialLink = {
  label: string;
  href: string;
};

const socialLinks = [
  { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL },
  { label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL },
  { label: "Spotify", href: process.env.NEXT_PUBLIC_SOCIAL_SPOTIFY_URL },
].filter((item): item is SocialLink => Boolean(item.href));

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f7f3ed] text-stone-900">
      <a href="#main-content" className="skip-link">
        Hopp til hovedinnhold
      </a>
      <Suspense fallback={null}>
        <PageAutoTranslator />
      </Suspense>
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
            <Link
              href="/gi"
              className={`${buttonVariants("secondary")} hidden lg:inline-flex`}
            >
              Gi
            </Link>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
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
          {socialLinks.length ? (
            <div className="flex items-center gap-4">
              {socialLinks.map((socialLink) => (
                <a
                  key={socialLink.label}
                  href={socialLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-stone-900"
                >
                  {socialLink.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
