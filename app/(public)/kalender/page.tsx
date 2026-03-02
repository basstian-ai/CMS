import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { SectionHeader } from "@/components/public/section-header";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import {
  getUpcomingEvents,
  normalizeLocale,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";
import { resolvePublicImageUrl } from "@/lib/utils/media";

export const revalidate = 600;

const fallbackLocale = "no";
const defaultImage =
  "https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png";

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
    weekday: "short",
    day: "numeric",
    month: "short",
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
    return `${dateLabel} kl. ${timeLabel}-${endTimeLabel}`;
  }

  return `${dateLabel} kl. ${timeLabel} - ${endDateLabel} kl. ${endTimeLabel}`;
}

const sanitizeExcerpt = (value: string | null | undefined) => {
  if (!value) {
    return "Les mer om arrangementet.";
  }

  const cleaned = value
    .replace(/[#*_`>\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Les mer om arrangementet.";
  }

  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
};

type CalendarPageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const events = await getUpcomingEvents(24);

  return (
    <section className="container-layout space-y-10 py-14 md:py-16">
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-soft">
        <SectionHeader
          eyebrow="Kalender"
          title="Kommende arrangementer"
          description="Planlegg neste besøk med oppdaterte tidspunkt, steder og detaljer."
          actions={
            <TrackedLink
              href="/kontakt"
              eventName="cta_click"
              eventPayload={{ location: "calendar_intro", target: "/kontakt" }}
              className={buttonVariants("outline")}
            >
              Har du spørsmål?
            </TrackedLink>
          }
        />
      </div>

      {events.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => {
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
            const description = sanitizeExcerpt(descriptionResult.value);

            return (
              <ContentCard
                key={event.id}
                title={
                  <AutoTranslatedText
                    text={title}
                    sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
                    targetLocale={locale}
                    enabled={titleResult.missingRequestedLocale}
                  />
                }
                description={
                  <AutoTranslatedText
                    text={description}
                    sourceLocale={descriptionResult.sourceLocale ?? fallbackLocale}
                    targetLocale={locale}
                    enabled={descriptionResult.missingRequestedLocale}
                  />
                }
                meta={`${formatEventDate(event.start_time, event.end_time)}${event.location ? ` - ${event.location}` : ""}`}
                href={`/kalender/${event.slug}`}
                hrefLabel="Se detaljer"
                trackingLabel={title}
                imageSrc={resolvePublicImageUrl(event.cover_image_path) ?? defaultImage}
                imageAlt={title}
                variant="event"
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Ingen kommende arrangementer"
          description="Vi legger snart ut nye datoer. Ta gjerne kontakt hvis du lurer pa noe."
          actionLabel="Kontakt oss"
          actionHref="/kontakt"
        />
      )}
    </section>
  );
}
