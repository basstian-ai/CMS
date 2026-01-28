import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="text-2xl font-semibold text-stone-900">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-xl font-semibold text-stone-900">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-lg font-semibold text-stone-900">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-base leading-relaxed text-stone-700">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 pl-6 text-stone-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 pl-6 text-stone-700">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => (
    <a className="text-brand-700 underline" href={href}>
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-brand-200 pl-4 text-stone-600">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[#efe5d8] px-1 py-0.5 text-sm text-stone-800">
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
