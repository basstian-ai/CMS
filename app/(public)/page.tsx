import type { Route } from "next";
import { cookies } from "next/headers";

import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { FeatureTile } from "@/components/public/feature-tile";
import { Hero } from "@/components/public/hero";
import { SectionHeader } from "@/components/public/section-header";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { EventTicker } from "@/components/ui/event-ticker";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import {
  getLatestPosts,
  getLatestSermons,
  getUpcomingEvents,
  normalizeLocale,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";
import { resolvePublicImageUrl } from "@/lib/utils/media";

export const revalidate = 600;

const quickLinks: Array<{ title: string; description: string; href: Route; ctaLabel: string }> = [
  {
    title: "Gi",
    description: "Støtt arbeidet med engangsgave eller fast støtte.",
    href: "/gi",
    ctaLabel: "Se hvordan du kan gi",
  },
  {
    title: "Besøk oss",
    description: "Finn tid, sted og praktisk informasjon for ditt første besøk.",
    href: "/om-oss",
    ctaLabel: "Planlegg besøk",
  },
  {
    title: "Bli med",
    description: "Oppdag samlinger, arrangementer og fellesskap du kan delta i.",
    href: "/kalender",
    ctaLabel: "Se kommende samlinger",
  },
];

const fallbackLocale = "no";

const defaultImage =
  "https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png";

const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

const formatPublishedDate = (date: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(new Date(date));

const sanitizeExcerpt = (value: string | null | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }

  const normalized = value
    .replace(/[#*_`>\-\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return fallback;
  }

  if (normalized.length <= 160) {
    return normalized;
  }

  return `${normalized.slice(0, 157).trimEnd()}...`;
};

const sanitizeEventDescription = (value: string | null | undefined) => {
  if (!value) {
    return "Praktisk informasjon deles i kalenderoversikten.";
  }

  const normalized = value
    .replace(/[#*_`>\-\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "Praktisk informasjon deles i kalenderoversikten.";
  }

  return normalized.length <= 140
    ? normalized
    : `${normalized.slice(0, 137).trimEnd()}...`;
};

type HomePageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale =
    typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);

  const [upcomingEvents, latestPosts, latestSermons] = await Promise.all([
    getUpcomingEvents(4),
    getLatestPosts(3),
    getLatestSermons(3),
  ]);

  const tickerEvents = upcomingEvents.map((event) => {
    const titleResult = resolveLocalizedFieldWithMeta(
      event.title,
      locale,
      fallbackLocale,
    );

    return {
      id: event.id,
      title: titleResult.value ?? "Arrangement",
      titleSourceLocale: titleResult.sourceLocale ?? fallbackLocale,
      shouldAutoTranslateTitle: titleResult.missingRequestedLocale,
      dateLabel: formatEventDate(event.start_time),
      location: event.location,
      href: "/kalender" as Route,
    };
  });

  const heroImage = resolvePublicImageUrl(upcomingEvents[0]?.cover_image_path) ?? defaultImage;

  return (
    <div className="pb-14 md:pb-20">
      <EventTicker items={tickerEvents} locale={locale} />

      <Hero
        eyebrow="Velkommen til Bykirken"
        title="Kirke midt i byen, med mennesker i sentrum."
        description="Vi samles for tro, fellesskap og hverdagsliv. Bli kjent med oss, finn neste samling og ta ditt neste steg."
        primaryAction={{
          href: "/kalender",
          label: "Se neste samling",
          eventLabel: "hero_kalender",
          variant: "primary",
        }}
        secondaryAction={{
          href: "/kontakt",
          label: "Ta kontakt",
          eventLabel: "hero_kontakt",
          variant: "secondary",
        }}
        imageSrc={heroImage}
        imageAlt="Bykirken fellesskap"
      />

      <section className="container-layout space-y-8 py-12 md:py-14">
        <SectionHeader
          eyebrow="Snarveier"
          title="Tre raske innganger til det viktigste akkurat nå"
          description="Gjort for tydelighet: støtte, besøk og deltakelse i samme flyt."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {quickLinks.map((link) => (
            <FeatureTile
              key={link.title}
              title={link.title}
              description={link.description}
              href={link.href}
              ctaLabel={link.ctaLabel}
            />
          ))}
        </div>
      </section>

      <section className="bg-surface/80 py-12 md:py-14">
        <div className="container-layout space-y-8">
          <SectionHeader
            eyebrow="Kalender"
            title="Kommende samlinger"
            description="Her finner du det som skjer de neste dagene, med tid, sted og detaljer."
            actions={
              <TrackedLink
                href="/kalender"
                eventName="cta_click"
                eventPayload={{ location: "home_events", target: "/kalender" }}
                className={buttonVariants("outline")}
              >
                Se hele kalenderen
              </TrackedLink>
            }
          />

          {upcomingEvents.length ? (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => {
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

                return (
                  <li
                    key={event.id}
                    className="rounded-2xl border border-border bg-surface p-4 shadow-soft md:p-5"
                  >
                    <div className="grid gap-3 md:grid-cols-[220px_1fr] md:items-start">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
                        {formatEventDate(event.start_time)}
                        {event.location ? ` • ${event.location}` : ""}
                      </p>
                      <div className="space-y-2">
                        <h3 className="font-display text-2xl leading-tight text-ink">
                          <AutoTranslatedText
                            text={title}
                            sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
                            targetLocale={locale}
                            enabled={titleResult.missingRequestedLocale}
                          />
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-muted">
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
          ) : (
            <EmptyState
              title="Ingen kommende arrangementer akkurat nå"
              description="Nye datoer publiseres fortløpende. Du kan fortsatt ta kontakt om du vil vite mer."
              actionLabel="Kontakt oss"
              actionHref="/kontakt"
            />
          )}
        </div>
      </section>

      <section className="container-layout space-y-8 py-12 md:py-14">
        <SectionHeader
          eyebrow="Nyheter"
          title="Siste oppdateringer"
          description="Historier, kunngjøringer og glimt fra det som skjer i menigheten."
          actions={
            <TrackedLink
              href="/nyheter"
              eventName="cta_click"
              eventPayload={{ location: "home_news", target: "/nyheter" }}
              className={buttonVariants("secondary")}
            >
              Se alle nyheter
            </TrackedLink>
          }
        />

        {latestPosts.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((post) => {
              const titleResult = resolveLocalizedFieldWithMeta(
                post.title,
                locale,
                fallbackLocale,
              );
              const excerptResult = resolveLocalizedFieldWithMeta(
                post.excerpt,
                locale,
                fallbackLocale,
              );
              const title = titleResult.value ?? "Nyhet";
              const excerpt = sanitizeExcerpt(
                excerptResult.value,
                "Siste oppdateringer fra Bykirken kommer snart.",
              );

              return (
                <ContentCard
                  key={post.id}
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
                      text={excerpt}
                      sourceLocale={excerptResult.sourceLocale ?? fallbackLocale}
                      targetLocale={locale}
                      enabled={excerptResult.missingRequestedLocale}
                    />
                  }
                  meta={post.published_at ? `Publisert ${formatPublishedDate(post.published_at)}` : undefined}
                  href={`/nyheter/${post.slug}`}
                  hrefLabel="Les artikkel"
                  trackingLabel={title}
                  imageSrc={resolvePublicImageUrl(post.cover_image_path) ?? defaultImage}
                  imageAlt={title}
                  variant="news"
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Ingen nyheter publisert ennå"
            description="Vi jobber med nye artikler og oppdateringer. Kom tilbake snart."
          />
        )}
      </section>

      <section className="bg-canvas-muted/70 py-12 md:py-14">
        <div className="container-layout space-y-8">
          <SectionHeader
            eyebrow="Podcast"
            title="Nylige episoder"
            description="Lytt til taler fra Bykirken i nettleseren eller i favorittappen din."
            actions={
              <TrackedLink
                href="/podcast"
                eventName="cta_click"
                eventPayload={{ location: "home_podcast", target: "/podcast" }}
                className={buttonVariants("outline")}
              >
                Se alle episoder
              </TrackedLink>
            }
          />

          {latestSermons.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {latestSermons.map((sermon) => (
                <ContentCard
                  key={sermon.id}
                  title={sermon.title}
                  description={sanitizeExcerpt(
                    sermon.description,
                    "Episodebeskrivelse kommer snart.",
                  )}
                  meta={
                    sermon.published_at
                      ? `Publisert ${formatPublishedDate(sermon.published_at)}${sermon.preacher ? ` - ${sermon.preacher}` : ""}`
                      : sermon.preacher ?? "Publiseres snart"
                  }
                  href={`/podcast/${sermon.slug}`}
                  hrefLabel="Åpne episode"
                  variant="podcast"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Ingen episoder tilgjengelig ennå"
              description="Vi publiserer snart nye taler. Kom tilbake senere."
            />
          )}
        </div>
      </section>
    </div>
  );
}
