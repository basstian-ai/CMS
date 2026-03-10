import { FeatureTile } from "@/components/public/feature-tile";
import { Hero } from "@/components/public/hero";

const highlights = [
  {
    title: "Fellesskap",
    description:
      "Vi bygger et åpent og varmt fellesskap der mennesker i alle livsfaser kan finne tilhørighet.",
    href: "/kontakt",
    ctaLabel: "Ta kontakt",
  },
  {
    title: "Tro i hverdagen",
    description:
      "Vi ønsker å koble tro med hverdagsliv gjennom undervisning, bønn og samtaler med relevans.",
    href: "/podcast",
    ctaLabel: "Lytt til taler",
  },
  {
    title: "Byen vår",
    description:
      "Bykirken vil være en tydelig og omsorgsfull tilstedeværelse i Oslo gjennom handling og nærvær.",
    href: "/kalender",
    ctaLabel: "Se arrangementer",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="pb-14 md:pb-20">
      <Hero
        eyebrow="Om oss"
        title="Et kirkelig fellesskap midt i byen"
        description="Bykirken samler mennesker rundt tro, omsorg og lokalt engasjement. Vi vil vere en kirke med lave terskler og tydelig retning."
        primaryAction={{
          href: "/kalender",
          label: "Planlegg et besøk",
          eventLabel: "about_visit",
          variant: "primary",
        }}
        secondaryAction={{
          href: "/kontakt",
          label: "Snakk med oss",
          eventLabel: "about_contact",
          variant: "secondary",
        }}
      />

      <section className="container-layout space-y-8 py-12 md:py-14">
        <div className="max-w-3xl space-y-4">
          <h2 className="font-display text-3xl text-ink md:text-4xl">Dette er Bykirken</h2>
          <p className="text-base leading-relaxed text-ink-muted md:text-lg">
            Vi samles til gudstjenester, arrangementer og mindre fellesskap gjennom
            uka. Vart mal er at mennesker skal bli sett, utrustet og sendt ut i sin
            hverdag med tro, hap og retning.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {highlights.map((item) => (
            <FeatureTile
              key={item.title}
              title={item.title}
              description={item.description}
              href={item.href}
              ctaLabel={item.ctaLabel}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
