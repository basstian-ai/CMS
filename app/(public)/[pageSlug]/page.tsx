import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Heading } from "@/components/ui/typography";
import { getPageBySlug, normalizeLocale, resolveLocalizedField } from "@/lib/data";
import { toMetadataDescription } from "@/lib/utils/metadata";

export const revalidate = 3600;

const fallbackLocale = "no";

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
  const descriptionSource = resolveLocalizedField(
    page.content_md,
    locale,
    fallbackLocale,
  );

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

  const title =
    resolveLocalizedField(page.title, locale, fallbackLocale) ?? "Infoside";
  const content =
    resolveLocalizedField(page.content_md, locale, fallbackLocale) ??
    "Innholdet er ikke tilgjengelig ennå.";

  return (
    <article className="container-layout space-y-8 py-16">
      <header>
        <Heading>{title}</Heading>
      </header>
      <MarkdownRenderer content={content} />
    </article>
  );
}
