import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
      <ReactMarkdown
        className="space-y-5"
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl font-semibold text-slate-900">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-xl font-semibold text-slate-900">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-lg font-semibold text-slate-900">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-base leading-relaxed text-slate-700">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6 text-slate-700">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          a: ({ children, href }) => (
            <a className="text-brand-600 underline" href={href}>
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-200 pl-4 text-slate-600">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1 py-0.5 text-sm text-slate-800">
              {children}
            </code>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
