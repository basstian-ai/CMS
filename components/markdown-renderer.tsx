"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="font-display text-3xl text-ink">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="font-display text-2xl text-ink">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-display text-xl text-ink">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-base leading-relaxed text-ink-muted md:text-lg">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-6 text-ink-muted">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-6 text-ink-muted">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => (
    <a className="text-accent-strong underline decoration-accent/70 underline-offset-4" href={href}>
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent-soft pl-4 text-ink-muted">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-accent-soft px-1 py-0.5 text-sm text-ink">
      {children}
    </code>
  ),
};

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const wrapperClassName = className ? `space-y-5 ${className}` : "space-y-5";

  return (
    <div className={wrapperClassName}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}
