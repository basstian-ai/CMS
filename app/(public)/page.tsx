import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BodyText, Heading, Subheading } from "@/components/ui/typography";

const quickLinks = [
  { title: "Gi", description: "Støtt arbeidet med et engangsgave eller fast støtte.", href: "/gi" },
  { title: "Besøk oss", description: "Finn tid, sted og praktisk informasjon.", href: "/om-oss" },
  { title: "Meld deg på", description: "Påmelding til samlinger og arrangement.", href: "/kalender" },
];

const news = [
  {
    title: "Høstprogram 2024",
    summary: "Oppdag nye grupper og samlinger gjennom høsten.",
  },
  {
    title: "Sommerfest i parken",
    summary: "Vi samles til fellesskap, mat og aktiviteter for alle aldre.",
  },
  {
    title: "Ny podcast-serie",
    summary: "Hør siste taler og refleksjoner direkte fra scenen.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-white">
        <div className="container-layout grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-medium text-brand-700">
              Neste gudstjeneste · Søndag 11:00
            </div>
            <Heading>Kirke midt i byen, mennesker i sentrum.</Heading>
            <BodyText>
              Velkommen til Bykirken! Vi bygger fellesskap, tro og håp gjennom
              samlinger, podcaster og lokale initiativ.
            </BodyText>
            <div className="flex flex-wrap gap-3">
              <Button>Se kalender</Button>
              <Button variant="secondary">Bli med i fellesskapet</Button>
            </div>
          </div>
          <Card className="space-y-4">
            <div className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm font-medium text-slate-500">
              Bilde/illustrasjon
            </div>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Denne uken</p>
              <Subheading>City Nights</Subheading>
              <BodyText>
                Felleskveld med lovsang og undervisning torsdag kl. 19:00.
              </BodyText>
              <Button variant="ghost">Les mer</Button>
            </div>
          </Card>
        </div>
      </section>

      <section className="container-layout space-y-8 py-14">
        <div className="flex flex-col gap-2">
          <Subheading>Kommende høydepunkter</Subheading>
          <BodyText>Tre ting du ikke vil gå glipp av de neste ukene.</BodyText>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {quickLinks.map((link) => (
            <Card key={link.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">{link.title}</h3>
              <BodyText>{link.description}</BodyText>
              <Link className="text-sm font-semibold text-brand-600" href={link.href}>
                Gå til {link.title.toLowerCase()} →
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="container-layout space-y-8 py-14">
          <div className="flex items-center justify-between">
            <Subheading>Siste nyheter</Subheading>
            <Link className="text-sm font-semibold text-brand-600" href="/nyheter">
              Se alle nyheter
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <Card key={item.title} className="space-y-3">
                <div className="rounded-xl bg-slate-100 px-4 py-6 text-sm text-slate-500">
                  Bilde
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <BodyText>{item.summary}</BodyText>
                <Button variant="ghost">Les mer</Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
