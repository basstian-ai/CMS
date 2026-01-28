import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { BodyText, Heading } from "@/components/ui/typography";
import { getUpcomingEvents, normalizeLocale, resolveLocalizedField } from "@/lib/data";

export const revalidate = 600;

const fallbackLocale = "no";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kalender | Bykirken",
    description: "Se kommende arrangementer og samlinger i Bykirken.",
  };
}

function formatEventDate(start: string, end: string | null) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
  });
  const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
    timeStyle: "short",
  });
  const dateLabel = dateFormatter.format(startDate);
  const timeLabel = timeFormatter.format(startDate);

  if (!endDate) {
    return `${dateLabel} kl. ${timeLabel}`;
  }

  const endDateLabel = dateFormatter.format(endDate);
  const endTimeLabel = timeFormatter.format(endDate);

  if (dateLabel === endDateLabel) {
    return `${dateLabel} kl. ${timeLabel}–${endTimeLabel}`;
  }

  return `${dateLabel} kl. ${timeLabel} – ${endDateLabel} kl. ${endTimeLabel}`;
}

type CalendarPageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const events = await getUpcomingEvents(24);

  return (
    <section className="container-layout space-y-10 py-16">
      <header className="space-y-3">
        <Heading>Kalender</Heading>
        <BodyText>
          Se kommende arrangementer i Bykirken. Alle tider er oppdatert fortløpende og
          sortert etter starttidspunkt.
        </BodyText>
      </header>

      {events.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => {
            const title =
              resolveLocalizedField(event.title, locale, fallbackLocale) ??
              "Arrangement";
            const description =
              resolveLocalizedField(event.description_md, locale, fallbackLocale) ??
              "Les mer om arrangementet.";

            return (
              <Card key={event.id} className="flex h-full flex-col gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
                  <p className="text-sm text-stone-500">
                    {formatEventDate(event.start_time, event.end_time)}
                  </p>
                  {event.location ? (
                    <p className="text-sm text-stone-500">{event.location}</p>
                  ) : null}
                </div>
                <BodyText>{description}</BodyText>
                <Link className="text-sm font-semibold text-brand-700" href={`/kalender/${event.slug}`}>
                  Les mer →
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Ingen kommende arrangementer</h2>
          <BodyText>
            Vi legger snart ut nye datoer. Ta gjerne kontakt hvis du lurer på noe.
          </BodyText>
        </Card>
      )}
    </section>
  );
}
