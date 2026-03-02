import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { TrackedLink } from "@/components/public/tracked-link";
import { PublicDesktopNav } from "@/components/public/public-desktop-nav";
import { buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { PageAutoTranslator } from "@/components/ui/page-auto-translator";
import { isPublicRedesignEnabled } from "@/lib/site/public-redesign";
import { publicNavItems, publicPrimaryCta } from "@/lib/site/navigation";
import { cn } from "@/lib/utils";

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
  const redesignEnabled = isPublicRedesignEnabled();

  return (
    <div
      className={cn(
        "min-h-screen text-ink",
        redesignEnabled ? "bg-canvas" : "bg-[#f7f3ed] text-stone-900",
      )}
      data-redesign={redesignEnabled ? "enabled" : "disabled"}
    >
      <a href="#main-content" className="skip-link">
        Hopp til hovedinnhold
      </a>
      <Suspense fallback={null}>
        <PageAutoTranslator />
      </Suspense>

      <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/95 backdrop-blur">
        <div className="container-layout flex items-center justify-between gap-4 py-4">
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

          <PublicDesktopNav />

          <div className="flex items-center gap-3">
            <Suspense
              fallback={<div className="h-7 w-[72px] rounded-full bg-canvas-muted" aria-hidden />}
            >
              <LanguageToggle />
            </Suspense>
            <MobileMenu />
            <TrackedLink
              href={publicPrimaryCta.href}
              eventName="cta_click"
              eventPayload={{ location: "desktop_header", target: publicPrimaryCta.href }}
              className={`${buttonVariants("primary")} hidden lg:inline-flex`}
            >
              {publicPrimaryCta.label}
            </TrackedLink>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="container-layout grid gap-8 py-10 text-sm text-ink-muted md:grid-cols-3">
          <div className="space-y-3">
            <Image
              src="https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png"
              alt="Bykirken"
              width={140}
              height={44}
              className="h-8 w-auto"
            />
            <p>Storgata 1, 0001 Oslo</p>
            <p>hello@bykirken.no</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {publicNavItems.map((item) => (
              <TrackedLink
                key={item.href}
                href={item.href}
                eventName="nav_click"
                eventPayload={{ location: "footer", target: item.href, label: item.label }}
                className="rounded-sm py-0.5 underline-offset-4 transition hover:text-ink hover:underline"
              >
                {item.label}
              </TrackedLink>
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-ink">Følg oss</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((socialLink) => (
                <a
                  key={socialLink.label}
                  href={socialLink.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-sm underline-offset-4 transition hover:text-ink hover:underline"
                >
                  {socialLink.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
