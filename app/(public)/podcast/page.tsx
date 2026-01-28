import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { BodyText, Heading } from "@/components/ui/typography";
import { getLatestSermons } from "@/lib/data";

export const revalidate = 600;

const formatPublishedDate = (publishedAt: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(
    new Date(publishedAt)
  );

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Podcast | Bykirken",
    description: "Lytt til de siste talene fra Bykirken.",
  };
}

export default async function PodcastPage() {
  const sermons = await getLatestSermons(24);

  return (
    <section className="container-layout space-y-10 py-16">
      <header className="space-y-3">
        <Heading>Podcast</Heading>
        <BodyText>
          Lytt til de siste talene fra Bykirken. Finn hele biblioteket i Spotify
          eller Apple Podcasts.
        </BodyText>
      </header>

      {sermons.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {sermons.map((sermon) => {
            const publishedAt = sermon.published_at
              ? formatPublishedDate(sermon.published_at)
              : null;

            return (
              <Card key={sermon.id} className="flex h-full flex-col gap-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-stone-900">
                    {sermon.title}
                  </h2>
                  <div className="text-sm text-stone-500">
                    <p>{sermon.preacher ?? "Ukjent taler"}</p>
                    <p>
                      {publishedAt
                        ? `Publisert ${publishedAt}`
                        : "Publiseres snart"}
                    </p>
                  </div>
                </div>
                <Link
                  className="text-sm font-semibold text-brand-700"
                  href={`/podcast/${sermon.slug}`}
                >
                  Åpne episode →
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">
            Ingen episoder publisert ennå
          </h2>
          <BodyText>
            Vi oppdaterer snart med nye taler. Kom tilbake litt senere.
          </BodyText>
        </Card>
      )}
    </section>
  );
}
