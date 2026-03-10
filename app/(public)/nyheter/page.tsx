import type { Metadata } from "next";
import { cookies } from "next/headers";

import { ContentCard } from "@/components/public/content-card";
import { EmptyState } from "@/components/public/empty-state";
import { SectionHeader } from "@/components/public/section-header";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import { BodyText } from "@/components/ui/typography";
import {
  getPublishedPosts,
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
    title: "Nyheter | Bykirken",
    description: "Les de nyeste oppdateringene og historiene fra Bykirken.",
  };
}

const formatPublishedDate = (value: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "long" }).format(new Date(value));

const sanitizeExcerpt = (value: string | null | undefined) => {
  if (!value) {
    return "Les mer om denne oppdateringen.";
  }

  const cleaned = value
    .replace(/[#*_`>\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Les mer om denne oppdateringen.";
  }

  return cleaned.length > 170 ? `${cleaned.slice(0, 167)}...` : cleaned;
};

type NewsPageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const posts = await getPublishedPosts();

  return (
    <section className="container-layout space-y-10 py-14 md:py-16">
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-soft">
        <SectionHeader
          eyebrow="Nyheter"
          title="Siste fra menigheten"
          description="Oppdateringer, historier og nyheter sortert med nyeste forst."
          actions={
            <TrackedLink
              href="/kalender"
              eventName="cta_click"
              eventPayload={{ location: "news_intro", target: "/kalender" }}
              className={buttonVariants("outline")}
            >
              Se hva som skjer nå
            </TrackedLink>
          }
        />
      </div>

      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
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
            const excerpt = sanitizeExcerpt(excerptResult.value);
            const coverImageUrl = resolvePublicImageUrl(post.cover_image_path) ?? defaultImage;

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
                hrefLabel="Les mer"
                trackingLabel={title}
                imageSrc={coverImageUrl}
                imageAlt={title}
                variant="news"
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Ingen nyheter enda"
          description="Vi jobber med nye historier og oppdateringer. Kom tilbake snart."
        />
      )}

      <div className="rounded-3xl border border-border bg-canvas-muted/70 p-6">
        <BodyText>
          Tips: bruk språkvelgeren i toppen for a lese innhold pa norsk eller engelsk.
        </BodyText>
      </div>
    </section>
  );
}
