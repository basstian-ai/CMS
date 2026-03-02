import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AutoTranslatedMarkdown } from "@/components/auto-translated-markdown";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import { Heading } from "@/components/ui/typography";
import {
  getEventBySlug,
  normalizeLocale,
  resolveLocalizedField,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";
import { toMetadataDescription } from "@/lib/utils/metadata";
import { resolvePublicImageUrl } from "@/lib/utils/media";

export const revalidate = 1800;

const fallbackLocale = "no";
const defaultImage =
  "https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png";

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
    return `${dateLabel} kl. ${timeLabel}-${endTimeLabel}`;
  }

  return `${dateLabel} kl. ${timeLabel} - ${endDateLabel} kl. ${endTimeLabel}`;
}

type CalendarDetailPageProps = {
  params: {
    slug: string;
  };
  searchParams?: { lang?: string | string[] };
};

export async function generateMetadata({
  params,
  searchParams,
}: CalendarDetailPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: "Arrangement ikke funnet | Bykirken",
      description: "Vi fant ikke arrangementet du lette etter.",
    };
  }

  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
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

export default async function CalendarDetailPage({
  params,
  searchParams,
}: CalendarDetailPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

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
  const description = descriptionResult.value ?? "Detaljer kommer snart.";
  const imageUrl = resolvePublicImageUrl(event.cover_image_path) ?? defaultImage;

  return (
    <section className="container-layout space-y-8 py-14 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Hjem" },
          { href: "/kalender", label: "Kalender" },
          { label: title },
        ]}
      />

      <header className="space-y-4">
        <Heading>
          <AutoTranslatedText
            text={title}
            sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
            targetLocale={locale}
            enabled={titleResult.missingRequestedLocale}
          />
        </Heading>
        <div className="space-y-1 text-base text-ink-muted">
          <p>{formatEventDate(event.start_time, event.end_time)}</p>
          {event.location ? <p>{event.location}</p> : null}
        </div>
      </header>

      <div className="relative h-[20rem] overflow-hidden rounded-[2rem] border border-border bg-canvas-muted shadow-soft md:h-[24rem]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-8">
        <AutoTranslatedMarkdown
          content={description}
          sourceLocale={descriptionResult.sourceLocale ?? fallbackLocale}
          targetLocale={locale}
          enabled={descriptionResult.missingRequestedLocale}
          className="space-y-5"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href="/kalender"
          eventName="cta_click"
          eventPayload={{ location: "calendar_detail", target: "/kalender" }}
          className={buttonVariants("secondary")}
        >
          Tilbake til kalender
        </TrackedLink>
        <TrackedLink
          href="/kontakt"
          eventName="cta_click"
          eventPayload={{ location: "calendar_detail", target: "/kontakt" }}
          className={buttonVariants("outline")}
        >
          Kontakt oss
        </TrackedLink>
      </div>
    </section>
  );
}
