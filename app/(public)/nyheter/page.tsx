import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AutoTranslatedText } from "@/components/ui/auto-translated-text";
import { BodyText, Heading } from "@/components/ui/typography";
import {
  getPublishedPosts,
  normalizeLocale,
  resolveLocalizedFieldWithMeta,
} from "@/lib/data";
import { resolvePublicImageUrl } from "@/lib/utils/media";

export const revalidate = 600;

const fallbackLocale = "no";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Nyheter | Bykirken",
    description: "Les de nyeste oppdateringene og historiene fra Bykirken.",
  };
}

type NewsPageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const cookieLocale = cookies().get("lang")?.value;
  const searchLocale = typeof searchParams?.lang === "string" ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
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
            const titleResult = resolveLocalizedFieldWithMeta(
              post.title,
              locale,
              fallbackLocale,
            );
            const excerptResult = resolveLocalizedFieldWithMeta(
              post.excerpt,
              locale,
              fallbackLocale,
            );
            const title = titleResult.value ?? "Nyhet";
            const excerpt =
              excerptResult.value ?? "Les mer om denne oppdateringen.";

            const coverImageUrl = resolvePublicImageUrl(post.cover_image_path);

            return (
              <Card key={post.id} className="flex h-full flex-col gap-4">
                {coverImageUrl ? (
                  <Image
                    src={coverImageUrl}
                    alt={title}
                    width={800}
                    height={384}
                    className="h-48 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-start justify-start rounded-xl bg-[#efe5d8] p-4 text-left text-sm text-stone-600">
                    Ingen cover-bilde
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-lg font-semibold text-stone-900">
                    <AutoTranslatedText
                      text={title}
                      sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
                      targetLocale={locale}
                      enabled={titleResult.missingRequestedLocale}
                    />
                  </h2>
                  <BodyText>
                    <AutoTranslatedText
                      text={excerpt}
                      sourceLocale={excerptResult.sourceLocale ?? fallbackLocale}
                      targetLocale={locale}
                      enabled={excerptResult.missingRequestedLocale}
                    />
                  </BodyText>
                </div>
                <Link className={`${buttonVariants("ghost")} mt-auto`} href={`/nyheter/${post.slug}`}>
                  Les mer
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-stone-900">Ingen nyheter enda</h2>
          <BodyText>
            Vi jobber med nye historier og oppdateringer. Kom tilbake snart!
          </BodyText>
        </Card>
      )}
    </section>
  );
}
