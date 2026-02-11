import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BodyText, Heading } from "@/components/ui/typography";
import { getPublishedPosts, normalizeLocale, resolveLocalizedField } from "@/lib/data";

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
            const title =
              resolveLocalizedField(post.title, locale, fallbackLocale) ?? "Nyhet";
            const excerpt =
              resolveLocalizedField(post.excerpt, locale, fallbackLocale) ??
              "Les mer om denne oppdateringen.";

            return (
              <Card key={post.id} className="flex h-full flex-col gap-4">
                {post.cover_image_path ? (
                  <Image
                    src={post.cover_image_path}
                    alt={title}
                    width={800}
                    height={384}
                    className="h-48 w-full rounded-xl object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-[#efe5d8] text-sm text-stone-600">
                    Ingen cover-bilde
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
                  <BodyText>{excerpt}</BodyText>
                </div>
                <Link className={buttonVariants("ghost")} href={`/nyheter/${post.slug}`}>
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
