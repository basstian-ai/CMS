
import type { Route } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { BodyText, Heading, Subheading } from "@/components/ui/typography";
import {
  getLatestPosts,
  getUpcomingEvents,
  resolveLocalizedField,
} from "@/lib/data";

export const revalidate = 600;

const quickLinks: Array<{ title: string; description: string; href: Route }> = [
  { title: "Gi", description: "Støtt arbeidet med et engangsgave eller fast støtte.", href: "/gi" },
  { title: "Besøk oss", description: "Finn tid, sted og praktisk informasjon.", href: "/om-oss" },
  { title: "Meld deg på", description: "Påmelding til samlinger og arrangement.", href: "/kalender" },
];

const locale = "no";

const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition";
const buttonVariants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export default async function HomePage() {
  const [upcomingEvents, latestPosts] = await Promise.all([
    getUpcomingEvents(1),
    getLatestPosts(3),
  ]);
  const nextEvent = upcomingEvents[0] ?? null;
  const nextEventTitle =
    resolveLocalizedField(nextEvent?.title, locale) ?? "Neste samling";
  const nextEventDescription =
    resolveLocalizedField(nextEvent?.description_md, locale) ??
    "Vi oppdaterer programmet snart. Følg med for detaljer om neste arrangement.";
  const nextEventDate = nextEvent?.start_time ? formatEventDate(nextEvent.start_time) : null;
  const nextEventLocation = nextEvent?.location ?? "Sted annonseres snart";

  return (
    <div>
      <section className="bg-white">
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
                className={`${buttonBaseClasses} ${buttonVariants.primary}`}
                href="/kalender"
              >
                Se kalender
              </Link>
              <Link
                className={`${buttonBaseClasses} ${buttonVariants.secondary}`}
                href="/kontakt"
              >
                Bli med i fellesskapet
              </Link>
            </div>
          </div>
          <Card className="space-y-4">
            <div className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm font-medium text-slate-500">
              Bilde/illustrasjon
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Denne uken</p>
              <Subheading>{nextEventTitle}</Subheading>
              <BodyText>{nextEventDate ? `${nextEventDate} · ${nextEventLocation}` : "Ingen publiserte arrangementer enda."}</BodyText>
              <Link
                className={`${buttonBaseClasses} ${buttonVariants.ghost}`}
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
          <h3 className="text-lg font-semibold text-slate-900">{nextEventTitle}</h3>
          <BodyText>
            {nextEventDate
              ? `${nextEventDate} · ${nextEventLocation}`
              : "Neste arrangement legges ut snart. Sjekk kalenderen for oppdateringer."}
          </BodyText>
          <Link className="text-sm font-semibold text-brand-600" href="/kalender">
            Se hele kalenderen →
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
              <h3 className="text-lg font-semibold text-slate-900">{link.title}</h3>
              <BodyText>{link.description}</BodyText>

              <Link className="text-sm font-semibold text-brand-600" href={link.href}>
                Gå til {link.title.toLowerCase()} →
              </Link>

            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-layout space-y-8 py-14">
          <div className="flex items-center justify-between">
            <Subheading>Siste nyheter</Subheading>
            <Link className="text-sm font-semibold text-brand-600" href="/nyheter">
              Se alle nyheter
            </Link>

          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestPosts.length ? (
              latestPosts.map((post) => {
                const title =
                  resolveLocalizedField(post.title, locale) ?? "Nyhet";
                const excerpt =
                  resolveLocalizedField(post.excerpt, locale) ??
                  "Siste oppdateringer fra Bykirken kommer snart.";

                return (
                  <Card key={post.id} className="space-y-3">
                    <div className="rounded-xl bg-slate-100 px-4 py-6 text-sm text-slate-500">
                      {post.cover_image_path ? "Bilde tilgjengelig" : "Bilde"}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <BodyText>{excerpt}</BodyText>
                    <Link
                      className={`${buttonBaseClasses} ${buttonVariants.ghost}`}
                      href={`/nyheter/${post.slug}`}
                    >
                      Les mer
                    </Link>
                  </Card>
                );
              })
            ) : (
              <Card className="space-y-3 md:col-span-3">
                <h3 className="text-lg font-semibold text-slate-900">Ingen nyheter enda</h3>
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
