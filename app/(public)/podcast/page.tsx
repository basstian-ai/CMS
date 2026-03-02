import type { Metadata } from "next";

import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { SectionHeader } from "@/components/public/section-header";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
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

const sanitizeExcerpt = (value: string | null | undefined) => {
  if (!value) {
    return "Episodebeskrivelse kommer snart.";
  }

  const cleaned = value.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "Episodebeskrivelse kommer snart.";
  }

  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
};

export default async function PodcastPage() {
  const sermons = await getLatestSermons(24);

  return (
    <section className="container-layout space-y-10 py-14 md:py-16">
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-soft">
        <SectionHeader
          eyebrow="Podcast"
          title="Lytt til de siste talene"
          description="Finn episoder med tema, bibelreferanser og talere fra Bykirken."
          actions={
            <TrackedLink
              href="/kontakt"
              eventName="cta_click"
              eventPayload={{ location: "podcast_intro", target: "/kontakt" }}
              className={buttonVariants("outline")}
            >
              Tips oss om tema
            </TrackedLink>
          }
        />
      </div>

      {sermons.length ? (
        <div className="grid gap-6 md:grid-cols-2">
          {sermons.map((sermon) => {
            const publishedAt = sermon.published_at
              ? formatPublishedDate(sermon.published_at)
              : null;

            return (
              <ContentCard
                key={sermon.id}
                title={sermon.title}
                description={sanitizeExcerpt(sermon.description)}
                meta={`${sermon.preacher ?? "Ukjent taler"}${publishedAt ? ` - Publisert ${publishedAt}` : " - Publiseres snart"}`}
                href={`/podcast/${sermon.slug}`}
                hrefLabel="Åpne episode"
                trackingLabel={sermon.title}
                variant="podcast"
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Ingen episoder publisert ennå"
          description="Vi oppdaterer snart med nye taler. Kom tilbake litt senere."
        />
      )}
    </section>
  );
}
