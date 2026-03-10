import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { BodyText, Heading } from "@/components/ui/typography";
import { getSermonBySlug } from "@/lib/data";
import { createSupabasePublicClient } from "@/lib/supabase/server";

export const revalidate = 1800;

const formatPublishedDate = (publishedAt: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "long" }).format(
    new Date(publishedAt)
  );

type PodcastDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: PodcastDetailPageProps): Promise<Metadata> {
  const sermon = await getSermonBySlug(params.slug);

  if (!sermon) {
    return {
      title: "Episode ikke funnet | Bykirken",
      description: "Vi fant ikke podcast-episoden du lette etter.",
    };
  }

  return {
    title: `${sermon.title} | Bykirken`,
    description: sermon.description ?? "Lytt til en tale fra Bykirken.",
  };
}

export default async function PodcastDetailPage({ params }: PodcastDetailPageProps) {
  const sermon = await getSermonBySlug(params.slug);

  if (!sermon) {
    notFound();
  }

  const publishedAt = sermon.published_at
    ? formatPublishedDate(sermon.published_at)
    : null;

  const supabase = createSupabasePublicClient();
  const audioUrl = sermon.audio_path
    ? supabase.storage.from("podcasts").getPublicUrl(sermon.audio_path).data.publicUrl
    : null;

  return (
    <section className="container-layout space-y-8 py-14 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Hjem" },
          { href: "/podcast", label: "Podcast" },
          { label: sermon.title },
        ]}
      />

      <header className="space-y-4">
        <Heading>{sermon.title}</Heading>
        <div className="space-y-1 text-base text-ink-muted">
          <p>{sermon.preacher ?? "Ukjent taler"}</p>
          <p>
            {publishedAt ? `Publisert ${publishedAt}` : "Publiseringsdato kommer snart"}
          </p>
          {sermon.bible_ref ? <p>{sermon.bible_ref}</p> : null}
        </div>
      </header>

      {sermon.description ? (
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-8">
          <BodyText className="max-w-3xl whitespace-pre-line">
            {sermon.description}
          </BodyText>
        </div>
      ) : null}

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="space-y-4">
          {audioUrl ? (
            <audio controls className="w-full" preload="metadata">
              <source src={audioUrl} type="audio/mpeg" />
              Nettleseren din støtter ikke avspilling av lyd.
            </audio>
          ) : (
            <BodyText>Lydfilen er ikke tilgjengelig ennå.</BodyText>
          )}

          {(sermon.external_spotify_url || sermon.external_apple_url) && (
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              {sermon.external_spotify_url ? (
                <a
                  href={sermon.external_spotify_url}
                  className={buttonVariants("primary")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lytt i Spotify
                </a>
              ) : null}
              {sermon.external_apple_url ? (
                <a
                  href={sermon.external_apple_url}
                  className={buttonVariants(
                    sermon.external_spotify_url ? "secondary" : "primary"
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Lytt i Apple Podcasts
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href="/podcast"
          eventName="cta_click"
          eventPayload={{ location: "podcast_detail", target: "/podcast" }}
          className={buttonVariants("secondary")}
        >
          Tilbake til podcast
        </TrackedLink>
        <TrackedLink
          href="/kalender"
          eventName="cta_click"
          eventPayload={{ location: "podcast_detail", target: "/kalender" }}
          className={buttonVariants("outline")}
        >
          Se kommende samlinger
        </TrackedLink>
      </div>
    </section>
  );
}
