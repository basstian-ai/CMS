import { createSupabasePublicClient } from "@/lib/supabase/server";

const SITE_URL = "https://www.bykirken.no";
const LEGACY_MEDIA_URL = `${SITE_URL}/images/stories/media`;

type SermonRecord = {
  filename: string;
  published_at: string | null;
  file_size: number | null;
  duration_seconds: number | null;
  title: string | null;
  description: string | null;
};

const publishedFilter = {
  now: () => new Date().toISOString(),
};

const formatRssDate = (value: string) => new Date(value).toUTCString();

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const supabase = createSupabasePublicClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("sermons")
    .select(
      "filename, published_at, file_size, duration_seconds, title, description",
    )
    .or(`published_at.is.null,published_at.lte.${now}`)
    .order("published_at", { ascending: false });

  if (error) {
    return new Response("Failed to load sermons.", { status: 500 });
  }

  const items = (data ?? [])
    .filter(
      (sermon): sermon is SermonRecord =>
        Boolean(sermon.filename) && typeof sermon.filename === "string",
    )
    .map((sermon) => {
      const title = escapeXml(sermon.title ?? "Tale fra Bykirken");
      const description = escapeXml(sermon.description ?? "");
      const enclosureUrl = `${LEGACY_MEDIA_URL}/${sermon.filename}`;
      const publishedAt = sermon.published_at
        ? formatRssDate(sermon.published_at)
        : null;
      const length = sermon.file_size ?? 0;
      const duration = sermon.duration_seconds ?? 0;

      return [
        "    <item>",
        `      <title>${title}</title>`,
        `      <description>${description}</description>`,
        `      <link>${enclosureUrl}</link>`,
        publishedAt ? `      <pubDate>${publishedAt}</pubDate>` : null,
        `      <enclosure url="${enclosureUrl}" length="${length}" type="audio/mpeg" />`,
        `      <itunes:duration>${duration}</itunes:duration>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const rss = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">',
    "  <channel>",
    "    <title>Bykirken Podcast</title>",
    `    <link>${SITE_URL}</link>`,
    "    <description>Podcast med taler fra Bykirken.</description>",
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
