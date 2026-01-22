import { notFound } from "next/navigation";

import { MarkdownRenderer } from "@/components/markdown-renderer";
import { BodyText, Heading } from "@/components/ui/typography";
import { getPostBySlug, resolveLocalizedField } from "@/lib/data";

export const revalidate = 1800;

const locale = "no";
const fallbackLocale = "en";

const formatPublishedDate = (publishedAt: string) =>
  new Intl.DateTimeFormat("nb-NO", { dateStyle: "long" }).format(new Date(publishedAt));

type NewsDetailPageProps = {
  params: {
    slug: string;
  };
};

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const title =
    resolveLocalizedField(post.title, locale, fallbackLocale) ?? "Nyhet";
  const content =
    resolveLocalizedField(post.content_md, locale, fallbackLocale) ??
    "Innholdet er ikke tilgjengelig ennå.";
  const publishedAt = post.published_at ? formatPublishedDate(post.published_at) : null;

  return (
    <article className="container-layout space-y-8 py-16">
      <header className="space-y-3">
        <Heading>{title}</Heading>
        <BodyText>
          {publishedAt ? `Publisert ${publishedAt}` : "Publiseringsdato kommer snart"}
        </BodyText>
      </header>

      {post.cover_image_path ? (
        <img
          src={post.cover_image_path}
          alt={title}
          className="h-80 w-full rounded-2xl object-cover"
        />
      ) : null}

      <MarkdownRenderer content={content} className="space-y-4" />
    </article>
  );
}
