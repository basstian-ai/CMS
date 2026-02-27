import type { Route } from 'next';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EventTicker } from '@/components/ui/event-ticker';
import { AutoTranslatedText } from '@/components/ui/auto-translated-text';
import { BodyText, Heading, Subheading } from '@/components/ui/typography';
import {
  getLatestPosts,
  getUpcomingEvents,
  normalizeLocale,
  resolveLocalizedFieldWithMeta,
} from '@/lib/data';
import { resolvePublicImageUrl } from '@/lib/utils/media';

export const revalidate = 600;

const quickLinks: Array<{ title: string; description: string; href: Route }> = [
  {
    title: 'Gi',
    description: 'Støtt arbeidet med et engangsgave eller fast støtte.',
    href: '/gi',
  },
  {
    title: 'Besøk oss',
    description: 'Finn tid, sted og praktisk informasjon.',
    href: '/om-oss',
  },
  {
    title: 'Meld deg på',
    description: 'Påmelding til samlinger og arrangement.',
    href: '/kalender',
  },
];

const fallbackLocale = 'no';

const defaultEventImage =
  'https://lfwpymqsqyuqevwuujkx.supabase.co/storage/v1/object/public/images/IMG_0395.png';
const defaultPostImage = defaultEventImage;

const formatEventDate = (date: string) =>
  new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

type HomePageProps = {
  searchParams?: { lang?: string | string[] };
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const cookieLocale = cookies().get('lang')?.value;
  const searchLocale =
    typeof searchParams?.lang === 'string' ? searchParams.lang : null;
  const locale = normalizeLocale(searchLocale ?? cookieLocale, fallbackLocale);
  const [upcomingEvents, latestPosts] = await Promise.all([
    getUpcomingEvents(3),
    getLatestPosts(3),
  ]);
  const tickerEvents = upcomingEvents.map((event) => {
    const titleResult = resolveLocalizedFieldWithMeta(
      event.title,
      locale,
      fallbackLocale,
    );

    return {
      id: event.id,
      title: titleResult.value ?? 'Arrangement',
      titleSourceLocale: titleResult.sourceLocale ?? fallbackLocale,
      shouldAutoTranslateTitle: titleResult.missingRequestedLocale,
      dateLabel: formatEventDate(event.start_time),
      location: event.location ?? 'Sted annonseres snart',
      href: `/kalender/${event.slug}` as Route,
    };
  });

  return (
    <div>
      <EventTicker items={tickerEvents} locale={locale} />
      <section className="bg-[#fffaf3]">
        <div className="container-layout grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-medium text-brand-700">
              Velkommen til Bykirken
            </div>
            <Heading>Kirke midt i byen, mennesker i sentrum.</Heading>
            <BodyText>
              Vi er et fellesskap for tro, håp og hverdagsliv. Se hva som skjer
              i kalenderen og finn din plass i fellesskapet.
            </BodyText>
            <div className="flex flex-wrap gap-3">
              <Link className={buttonVariants('primary')} href="/kalender">
                Se kalender
              </Link>
              <Link className={buttonVariants('secondary')} href="/kontakt">
                Bli med i fellesskapet
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={defaultEventImage}
                alt="Bykirken"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
          </Card>
        </div>
      </section>

      <section className="container-layout space-y-8 pb-14">
        <div className="flex flex-col gap-2">
          <Subheading>Snarveier</Subheading>
          <BodyText>Raske veier til det viktigste akkurat nå.</BodyText>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.title} className="flex h-full flex-col gap-3">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-stone-900">
                  {link.title}
                </h3>
                <BodyText>{link.description}</BodyText>
              </div>

              <Link className={buttonVariants('ghost') + ' mt-auto'} href={link.href}>
                Gå til {link.title.toLowerCase()}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#fffaf3]">
        <div className="container-layout space-y-8 py-14">
          <div className="flex items-center justify-between">
            <Subheading>Siste nyheter</Subheading>
            <Link className={buttonVariants('secondary')} href="/nyheter">
              Se alle nyheter
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {latestPosts.length ? (
              latestPosts.map((post) => {
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
                const title = titleResult.value ?? 'Nyhet';
                const excerpt =
                  excerptResult.value ??
                  'Siste oppdateringer fra Bykirken kommer snart.';

                return (
                  <Card key={post.id} className="flex h-full flex-col gap-3">
                    <div className="relative h-40 overflow-hidden rounded-xl">
                      <Image
                        src={
                          resolvePublicImageUrl(post.cover_image_path) ??
                          defaultPostImage
                        }
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-stone-900">
                        <AutoTranslatedText
                          text={title}
                          sourceLocale={titleResult.sourceLocale ?? fallbackLocale}
                          targetLocale={locale}
                          enabled={titleResult.missingRequestedLocale}
                        />
                      </h3>
                      <BodyText>
                        <AutoTranslatedText
                          text={excerpt}
                          sourceLocale={excerptResult.sourceLocale ?? fallbackLocale}
                          targetLocale={locale}
                          enabled={excerptResult.missingRequestedLocale}
                        />
                      </BodyText>
                    </div>
                    <Link
                      className={buttonVariants('ghost') + ' mt-auto'}
                      href={`/nyheter/${post.slug}`}
                    >
                      Les mer
                    </Link>
                  </Card>
                );
              })
            ) : (
              <Card className="space-y-3 md:col-span-3">
                <h3 className="text-lg font-semibold text-stone-900">
                  Ingen nyheter enda
                </h3>
                <BodyText>
                  Vi jobber med nye historier og oppdateringer. Kom tilbake
                  snart!
                </BodyText>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
