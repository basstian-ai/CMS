import { notFound } from "next/navigation";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Heading } from "@/components/ui/typography";
import { getPageBySlug, resolveLocalizedField } from "@/lib/data";

export const revalidate = 3600;

const locale = "no";
const fallbackLocale = "en";

type InfoPageProps = {
  params: {
    pageSlug: string;
  };
};

export default async function InfoPage({ params }: InfoPageProps) {
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
