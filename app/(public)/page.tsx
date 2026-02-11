
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BodyText, Heading, Subheading } from "@/components/ui/typography";
import {
  getLatestPosts,
  getUpcomingEvents,
  normalizeLocale,
  resolveLocalizedField,
} from "@/lib/data";

export const revalidate = 600;

const quickLinks: Array<{ title: string; description: string; href: Route }> = [
  { title: "Gi", description: "Støtt arbeidet med et engangsgave eller fast støtte.", href: "/gi" },
  { title: "Besøk oss", description: "Finn tid, sted og praktisk informasjon.", href: "/om-oss" },
  { title: "Meld deg på", description: "Påmelding til samlinger og arrangement.", href: "/kalender" },
];

const fallbackLocale = "no";

const defaultEventImage =
  "https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png";
const defaultPostImage = defaultEventImage;

const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

type HomePageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const [upcomingEvents, latestPosts] = await Promise.all([
    getUpcomingEvents(1),
    getLatestPosts(3),
  ]);
  const nextEvent = upcomingEvents[0] ?? null;
  const nextEventTitle =
    resolveLocalizedField(nextEvent?.title, locale, fallbackLocale) ?? "Neste samling";
  const nextEventDescription =
    resolveLocalizedField(nextEvent?.description_md, locale, fallbackLocale) ??
    "Vi oppdaterer programmet snart. Følg med for detaljer om neste arrangement.";
  const nextEventDate = nextEvent?.start_time ? formatEventDate(nextEvent.start_time) : null;
  const nextEventLocation = nextEvent?.location ?? "Sted annonseres snart";
  const nextEventImage = nextEvent?.cover_image_path ?? defaultEventImage;

  return (
    <div>
      <section className="bg-[#fffaf3]">
        <div className="container-layout grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-medium text-brand-700">
              {nextEventDate ? `Neste samling · ${nextEventDate}` : "Neste samling oppdateres"}
            </div>
            <Heading>Kirke midt i byen, mennesker i sentrum.</Heading>
            <BodyText>
              {nextEventDescription}
            </BodyText>
            <div className="flex flex-wrap gap-3">
              <Link
                className={buttonVariants("primary")}
                href="/kalender"
              >
                Se kalender
              </Link>
              <Link
                className={buttonVariants("secondary")}
                href="/kontakt"
              >
                Bli med i fellesskapet
              </Link>
            </div>
          </div>
          <Card className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={nextEventImage}
                alt={nextEventTitle}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Denne uken</p>
              <Subheading>{nextEventTitle}</Subheading>
              <BodyText>{nextEventDate ? `${nextEventDate} · ${nextEventLocation}` : "Ingen publiserte arrangementer enda."}</BodyText>
              <Link
                className={buttonVariants("ghost")}
                href="/kalender"
              >
                Se kalender
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-layout space-y-8 py-14">
        <div className="flex flex-col gap-2">
          <Subheading>Kommende event</Subheading>
          <BodyText>Hold av tid til neste samling i fellesskapet.</BodyText>
        </div>
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-stone-900">{nextEventTitle}</h3>
          <BodyText>
            {nextEventDate
              ? `${nextEventDate} · ${nextEventLocation}`
              : "Neste arrangement legges ut snart. Sjekk kalenderen for oppdateringer."}
          </BodyText>
          <Link className={buttonVariants("primary")} href="/kalender">
            Se hele kalenderen
          </Link>
        </Card>
      </section>

      <section className="container-layout space-y-8 pb-14">
        <div className="flex flex-col gap-2">
          <Subheading>Snarveier</Subheading>
          <BodyText>Raske veier til det viktigste akkurat nå.</BodyText>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">{link.title}</h3>
              <BodyText>{link.description}</BodyText>

              <Link className={buttonVariants("ghost")} href={link.href}>
                Gå til {link.title.toLowerCase()}
              </Link>

            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#fffaf3]">
        <div className="container-layout space-y-8 py-14">
          <div className="flex items-center justify-between">
            <Subheading>Siste nyheter</Subheading>
            <Link className={buttonVariants("secondary")} href="/nyheter">
              Se alle nyheter
            </Link>

          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestPosts.length ? (
              latestPosts.map((post) => {
                const title =
                  resolveLocalizedField(post.title, locale, fallbackLocale) ?? "Nyhet";
                const excerpt =
                  resolveLocalizedField(post.excerpt, locale, fallbackLocale) ??
                  "Siste oppdateringer fra Bykirken kommer snart.";

                return (
                  <Card key={post.id} className="space-y-3">
                    <div className="relative h-40 overflow-hidden rounded-xl">
                      <Image
                        src={post.cover_image_path ?? defaultPostImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
                    <BodyText>{excerpt}</BodyText>
                    <Link
                      className={buttonVariants("ghost")}
                      href={`/nyheter/${post.slug}`}
                    >
                      Les mer
                    </Link>
                  </Card>
                );
              })
            ) : (
              <Card className="space-y-3 md:col-span-3">
                <h3 className="text-lg font-semibold text-stone-900">Ingen nyheter enda</h3>
                <BodyText>
                  Vi jobber med nye historier og oppdateringer. Kom tilbake snart!
                </BodyText>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
