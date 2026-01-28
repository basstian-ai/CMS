import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BodyText, Heading } from "@/components/ui/typography";
import { getSermonBySlug } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = createSupabaseServerClient();
  const audioUrl = sermon.audio_path
    ? supabase.storage.from("podcasts").getPublicUrl(sermon.audio_path).data.publicUrl
    : null;

  return (
    <section className="container-layout space-y-10 py-16">
      <header className="space-y-3">
        <Heading>{sermon.title}</Heading>
        <div className="space-y-1 text-sm text-stone-500">
          <p>{sermon.preacher ?? "Ukjent taler"}</p>
          <p>
            {publishedAt ? `Publisert ${publishedAt}` : "Publiseringsdato kommer snart"}
          </p>
          {sermon.bible_ref ? <p>{sermon.bible_ref}</p> : null}
        </div>
      </header>

      {sermon.description ? (
        <BodyText className="max-w-3xl whitespace-pre-line">
          {sermon.description}
        </BodyText>
      ) : null}

      <div className="space-y-4">
        {audioUrl ? (
          <audio controls className="w-full">
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
                className="rounded-full border border-[#e6ddcf] px-4 py-2 text-stone-700 transition hover:border-[#d6c8b5]"
                target="_blank"
                rel="noreferrer"
              >
                Lytt i Spotify
              </a>
            ) : null}
            {sermon.external_apple_url ? (
              <a
                href={sermon.external_apple_url}
                className="rounded-full border border-[#e6ddcf] px-4 py-2 text-stone-700 transition hover:border-[#d6c8b5]"
                target="_blank"
                rel="noreferrer"
              >
                Lytt i Apple Podcasts
              </a>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
