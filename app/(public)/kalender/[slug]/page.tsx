import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Heading } from "@/components/ui/typography";
import { getEventBySlug, resolveLocalizedField } from "@/lib/data";
import { toMetadataDescription } from "@/lib/utils/metadata";

export const revalidate = 1800;

const locale = "no";
const fallbackLocale = "en";

function formatEventDate(start: string, end: string | null) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "full",
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

type CalendarDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CalendarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Arrangement ikke funnet | Bykirken",
      description: "Vi fant ikke arrangementet du lette etter.",
    };
  }

  const title =
    resolveLocalizedField(event.title, locale, fallbackLocale) ?? "Arrangement";
  const descriptionSource = resolveLocalizedField(
    event.description_md,
    locale,
    fallbackLocale,
  );

  return {
    title: `${title} | Bykirken`,
    description: toMetadataDescription(
      descriptionSource,
      "Detaljer om arrangementer i Bykirken.",
    ),
  };
}

export default async function CalendarDetailPage({ params }: CalendarDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const title = resolveLocalizedField(event.title, locale, fallbackLocale) ?? "Arrangement";
  const description =
    resolveLocalizedField(event.description_md, locale, fallbackLocale) ??
    "Detaljer kommer snart.";

  return (
    <section className="container-layout space-y-8 py-16">
      <header className="space-y-3">
        <Heading>{title}</Heading>
        <div className="space-y-1 text-sm text-slate-500">
          <p>{formatEventDate(event.start_time, event.end_time)}</p>
          {event.location ? <p>{event.location}</p> : null}
        </div>
      </header>

      <MarkdownRenderer content={description} className="max-w-3xl" />
    </section>
  );
}
