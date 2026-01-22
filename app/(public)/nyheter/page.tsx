import Link from "next/link";

import { Card } from "@/components/ui/card";
import { BodyText, Heading } from "@/components/ui/typography";
import { getPublishedPosts, resolveLocalizedField } from "@/lib/data";

export const revalidate = 600;

const locale = "no";
const fallbackLocale = "en";

export default async function NewsPage() {
  const posts = await getPublishedPosts();

  return (
    <section className="container-layout space-y-10 py-16">
      <header className="space-y-3">
        <Heading>Nyheter</Heading>
        <BodyText>
          Les de nyeste oppdateringene fra Bykirken. Artiklene er sortert med de nyeste
          først.
        </BodyText>
      </header>

      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const title =
              resolveLocalizedField(post.title, locale, fallbackLocale) ?? "Nyhet";
            const excerpt =
              resolveLocalizedField(post.excerpt, locale, fallbackLocale) ??
              "Les mer om denne oppdateringen.";

            return (
              <Card key={post.id} className="flex h-full flex-col gap-4">
                {post.cover_image_path ? (
                  <img
                    src={post.cover_image_path}
                    alt={title}
                    className="h-48 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
                    Ingen cover-bilde
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                  <BodyText>{excerpt}</BodyText>
                </div>
                <Link className="text-sm font-semibold text-brand-600" href={`/nyheter/${post.slug}`}>
                  Les mer →
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Ingen nyheter enda</h2>
          <BodyText>
            Vi jobber med nye historier og oppdateringer. Kom tilbake snart!
          </BodyText>
        </Card>
      )}
    </section>
  );
}
