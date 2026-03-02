import type { Metadata } from "next";
import type { Route } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AutoTranslatedMarkdown } from "@/components/auto-translated-markdown";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import {
  getPageBySlug,
  normalizeLocale,
  resolveLocalizedField,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";
import { toMetadataDescription } from "@/lib/utils/metadata";
import { resolvePublicImageUrl } from "@/lib/utils/media";

export const revalidate = 3600;

const fallbackLocale = "no";

const layoutVariantClassNames: Record<string, string> = {
  standard: "",
  editorial: "md:grid-cols-[1.2fr_0.8fr]",
  compact: "md:grid-cols-[1fr]",
};

type InfoPageProps = {
  params: {
    pageSlug: string;
  };
  searchParams?: { lang?: string | string[] };
};

export async function generateMetadata({
  params,
  searchParams,
}: InfoPageProps): Promise<Metadata> {
  const page = await getPageBySlug(params.pageSlug);

  if (!page) {
    return {
      title: "Side ikke funnet | Bykirken",
      description: "Vi fant ikke siden du leter etter.",
    };
  }

  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const title =
    resolveLocalizedField(page.title, locale, fallbackLocale) ?? "Infoside";

  const summary = resolveLocalizedField(page.summary, locale, fallbackLocale);
  const descriptionSource =
    summary ||
    resolveLocalizedField(page.content_md, locale, fallbackLocale);

  return {
    title: `${title} | Bykirken`,
    description: toMetadataDescription(
      descriptionSource,
      "Informasjon fra Bykirken.",
    ),
  };
}

export default async function InfoPage({ params, searchParams }: InfoPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const page = await getPageBySlug(params.pageSlug);

  if (!page) {
    notFound();
  }

  const titleResult = resolveLocalizedFieldWithMeta(
    page.title,
    locale,
    fallbackLocale,
  );
  const summaryResult = resolveLocalizedFieldWithMeta(
    page.summary,
    locale,
    fallbackLocale,
  );
  const contentResult = resolveLocalizedFieldWithMeta(
    page.content_md,
    locale,
    fallbackLocale,
  );
  const ctaLabelResult = resolveLocalizedFieldWithMeta(
    page.cta_label,
    locale,
    fallbackLocale,
  );

  const title = titleResult.value ?? "Infoside";
  const summary = summaryResult.value ?? "";
  const content = contentResult.value ?? "Innholdet er ikke tilgjengelig ennå.";
  const ctaLabel = ctaLabelResult.value ?? null;
  const ctaHref = page.cta_href ?? null;
  const safeCtaHref = (
    ctaHref && ctaHref.startsWith("/") ? ctaHref : "/kontakt"
  ) as Route;
  const imageUrl = resolvePublicImageUrl(page.hero_image_path);
  const layoutVariant = page.layout_variant ?? "standard";
  const variantClassName = layoutVariantClassNames[layoutVariant] ?? layoutVariantClassNames.standard;

  return (
    <article className="container-layout space-y-8 py-14 md:py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Hjem" },
          { label: title },
        ]}
      />

      <header className={`grid gap-6 ${variantClassName}`}>
        <div className="space-y-4">
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            <AutoTranslatedText
              text={title}
              sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
              targetLocale={locale}
              enabled={titleResult.missingRequestedLocale}
            />
          </h1>
          {summary ? (
            <p className="max-w-3xl text-base leading-relaxed text-ink-muted md:text-lg">
              <AutoTranslatedText
                text={summary}
                sourceLocale={summaryResult.sourceLocale ?? fallbackLocale}
                targetLocale={locale}
                enabled={summaryResult.missingRequestedLocale}
              />
            </p>
          ) : null}
          {ctaHref && ctaLabel ? (
            <TrackedLink
              href={safeCtaHref}
              eventName="cta_click"
              eventPayload={{ location: "dynamic_page", target: ctaHref, label: ctaLabel }}
              className={buttonVariants("primary")}
            >
              <AutoTranslatedText
                text={ctaLabel}
                sourceLocale={ctaLabelResult.sourceLocale ?? fallbackLocale}
                targetLocale={locale}
                enabled={ctaLabelResult.missingRequestedLocale}
              />
            </TrackedLink>
          ) : null}
        </div>

        {imageUrl ? (
          <div className="relative h-64 overflow-hidden rounded-[2rem] border border-border bg-canvas-muted shadow-soft">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </header>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-8">
        <AutoTranslatedMarkdown
          content={content}
          sourceLocale={contentResult.sourceLocale ?? fallbackLocale}
          targetLocale={locale}
          enabled={contentResult.missingRequestedLocale}
          className="space-y-5"
        />
      </div>
    </article>
  );
}
