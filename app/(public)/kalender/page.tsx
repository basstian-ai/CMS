import type { Metadata } from "next";
import { cookies } from "next/headers";

import { EmptyState } from "@/components/public/empty-state";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import {
  getUpcomingEvents,
  normalizeLocale,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";

export const revalidate = 600;

const fallbackLocale = "no";
const monthFormatter = new Intl.DateTimeFormat("nb-NO", {
  month: "long",
});

type WeekGroup<TEvent> = {
  weekKey: string;
  weekStart: Date;
  items: TEvent[];
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Kalender | Bykirken",
    description: "Se kommende arrangementer og samlinger i Bykirken.",
  };
}

function formatEventMeta(start: string, end: string | null) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });

  const shortDateFormatter = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  });

  const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateLabel = dateFormatter.format(startDate);

  if (!endDate) {
    return {
      dateLabel,
      timeLabel: `kl. ${timeFormatter.format(startDate)}`,
    };
  }

  const isSameDay = startDate.toDateString() === endDate.toDateString();

  if (isSameDay) {
    return {
      dateLabel,
      timeLabel: `kl. ${timeFormatter.format(startDate)}-${timeFormatter.format(endDate)}`,
    };
  }

  return {
    dateLabel: `${dateLabel} - ${shortDateFormatter.format(endDate)}`,
    timeLabel: `kl. ${timeFormatter.format(startDate)}-${timeFormatter.format(endDate)}`,
  };
}

const sanitizeEventDescription = (value: string | null | undefined) => {
  if (!value) {
    return "Praktisk informasjon deles i samlingen.";
  }

  const cleaned = value
    .replace(/[#*_`>\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Praktisk informasjon deles i samlingen.";
  }

  return cleaned.length > 180 ? `${cleaned.slice(0, 177)}...` : cleaned;
};

function getWeekStart(date: Date) {
  const normalized = new Date(date);
  const day = normalized.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diffToMonday);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getWeekRangeLabel(weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  const startMonth = monthFormatter.format(weekStart);
  const endMonth = monthFormatter.format(weekEnd);

  if (startMonth === endMonth) {
    return `${startDay}.-${endDay}. ${startMonth}`;
  }

  return `${startDay}. ${startMonth}-${endDay}. ${endMonth}`;
}

function groupEventsByWeek<TEvent extends { start_time: string }>(events: TEvent[]) {
  const groupsMap = new Map<string, WeekGroup<TEvent>>();

  events.forEach((event) => {
    const weekStart = getWeekStart(new Date(event.start_time));
    const weekKey = weekStart.toISOString().slice(0, 10);

    const existingGroup = groupsMap.get(weekKey);

    if (existingGroup) {
      existingGroup.items.push(event);
      return;
    }

    groupsMap.set(weekKey, {
      weekKey,
      weekStart,
      items: [event],
    });
  });

  return Array.from(groupsMap.values());
}

type CalendarPageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const events = await getUpcomingEvents(24);
  const weeklyGroups = groupEventsByWeek(events);

  return (
    <section className="container-layout space-y-8 py-14 md:space-y-10 md:py-16">
      <div className="rounded-[2rem] border border-border bg-surface p-7 shadow-soft md:p-8">
        <div className="max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            Kalender
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink md:text-6xl">
            Kommende arrangementer
          </h1>
          <p className="text-base leading-relaxed text-ink-muted md:text-xl">
            En enkel oversikt over dato, tid og sted. Ingen ekstra klikk er nødvendig.
          </p>
          <TrackedLink
            href="/kontakt"
            eventName="cta_click"
            eventPayload={{ location: "calendar_intro", target: "/kontakt" }}
            className={buttonVariants("outline")}
          >
            Har du spørsmål?
          </TrackedLink>
        </div>
      </div>

      {events.length ? (
        <div className="space-y-4">
          {weeklyGroups.map((group) => (
            <section
              key={group.weekKey}
              className="overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-soft"
            >
              <header className="border-b border-border/70 bg-canvas-muted/75 px-5 py-3 md:px-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                  {getWeekRangeLabel(group.weekStart)}
                </p>
              </header>

              <ul>
                {group.items.map((event) => {
                  const titleResult = resolveLocalizedFieldWithMeta(
                    event.title,
                    locale,
                    fallbackLocale,
                  );
                  const descriptionResult = resolveLocalizedFieldWithMeta(
                    event.description_md,
                    locale,
                    fallbackLocale,
                  );
                  const title = titleResult.value ?? "Arrangement";
                  const description = sanitizeEventDescription(descriptionResult.value);
                  const eventMeta = formatEventMeta(event.start_time, event.end_time);

                  return (
                    <li
                      key={event.id}
                      className="border-t border-border/70 px-5 py-4 first:border-t-0 md:px-7 md:py-5"
                    >
                      <div className="grid gap-3 md:grid-cols-[200px_1fr] md:gap-6">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
                            {eventMeta.dateLabel}
                          </p>
                          <p className="text-sm font-semibold text-ink md:text-base">{eventMeta.timeLabel}</p>
                          {event.location ? (
                            <p className="text-xs uppercase tracking-[0.1em] text-ink-muted">{event.location}</p>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          <h2 className="font-display text-[1.7rem] leading-[1.08] text-ink md:text-[1.75rem]">
                            <AutoTranslatedText
                              text={title}
                              sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
                              targetLocale={locale}
                              enabled={titleResult.missingRequestedLocale}
                            />
                          </h2>
                          <p className="max-w-4xl text-sm leading-relaxed text-ink-muted md:text-base">
                            <AutoTranslatedText
                              text={description}
                              sourceLocale={descriptionResult.sourceLocale ?? fallbackLocale}
                              targetLocale={locale}
                              enabled={descriptionResult.missingRequestedLocale}
                            />
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ingen kommende arrangementer"
          description="Vi legger snart ut nye datoer. Ta gjerne kontakt hvis du lurer på noe."
          actionLabel="Kontakt oss"
          actionHref="/kontakt"
        />
      )}
    </section>
  );
}
