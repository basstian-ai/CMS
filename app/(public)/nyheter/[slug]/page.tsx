import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AutoTranslatedMarkdown } from "@/components/auto-translated-markdown";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import { BodyText, Heading } from "@/components/ui/typography";
import {
  getPostBySlug,
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

const formatPublishedDate = (publishedAt: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "long" }).format(new Date(publishedAt));

type NewsDetailPageProps = {
  params: {
    slug: string;
  };
  searchParams?: { lang?: string | string[] };
};

export async function generateMetadata({
  params,
  searchParams,
}: NewsDetailPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Nyhet ikke funnet | Bykirken",
      description: "Vi fant ikke nyheten du lette etter.",
    };
  }

  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const title =
    resolveLocalizedField(post.title, locale, fallbackLocale) ?? "Nyhet";
  const descriptionSource = resolveLocalizedField(
    post.content_md,
    locale,
    fallbackLocale,
  );

  return {
    title: `${title} | Bykirken`,
    description: toMetadataDescription(
      descriptionSource,
      "Les siste nyheter og oppdateringer fra Bykirken.",
    ),
  };
}

export default async function NewsDetailPage({
  params,
  searchParams,
}: NewsDetailPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const titleResult = resolveLocalizedFieldWithMeta(
    post.title,
    locale,
    fallbackLocale,
  );
  const contentResult = resolveLocalizedFieldWithMeta(
    post.content_md,
    locale,
    fallbackLocale,
  );
  const title = titleResult.value ?? "Nyhet";
  const content = contentResult.value ?? "Innholdet er ikke tilgjengelig ennå.";
  const publishedAt = post.published_at ? formatPublishedDate(post.published_at) : null;
  const coverImageUrl = resolvePublicImageUrl(post.cover_image_path) ?? defaultImage;

  return (
    <article className="container-layout space-y-8 py-14 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Hjem" },
          { href: "/nyheter", label: "Nyheter" },
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
        <BodyText>
          {publishedAt ? `Publisert ${publishedAt}` : "Publiseringsdato kommer snart"}
        </BodyText>
      </header>

      <div className="relative h-[22rem] overflow-hidden rounded-[2rem] border border-border bg-canvas-muted shadow-soft md:h-[28rem]">
        <Image
          src={coverImageUrl}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-8">
        <AutoTranslatedMarkdown
          content={content}
          sourceLocale={contentResult.sourceLocale ?? fallbackLocale}
          targetLocale={locale}
          enabled={contentResult.missingRequestedLocale}
          className="space-y-5"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <TrackedLink
          href="/nyheter"
          eventName="cta_click"
          eventPayload={{ location: "news_detail", target: "/nyheter" }}
          className={buttonVariants("secondary")}
        >
          Tilbake til nyheter
        </TrackedLink>
        <TrackedLink
          href="/kalender"
          eventName="cta_click"
          eventPayload={{ location: "news_detail", target: "/kalender" }}
          className={buttonVariants("outline")}
        >
          Se kalender
        </TrackedLink>
      </div>
    </article>
  );
}
