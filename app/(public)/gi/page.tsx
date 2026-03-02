import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";

const givingOptions = [
  {
    title: "Engangsgave",
    description:
      "Gi en gave når det passer deg. Nyttig for kampanjer, prosjekter eller spontan støtte.",
  },
  {
    title: "Fast gave",
    description:
      "Månedlig støtte gir forutsigbarhet og gjør det lettere å planlegge arbeidet over tid.",
  },
  {
    title: "Praktisk hjelp",
    description:
      "Du kan også bidra med tid, kompetanse og frivillig innsats i ulike team.",
  },
] as const;

export default function GivePage() {
  return (
    <section className="container-layout space-y-10 py-14 md:py-16">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
          Gi
        </p>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Takk for at du vil bidra</h1>
        <p className="text-base leading-relaxed text-ink-muted md:text-lg">
          Gaver hjelper oss med å drive menighet, omsorgsarbeid og lokale tiltak.
          Under finner du de vanligste måtene å bidra på.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {givingOptions.map((option) => (
          <article key={option.title} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
            <h2 className="font-display text-2xl text-ink">{option.title}</h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">{option.description}</p>
          </article>
        ))}
      </div>

      <div className="rounded-[2rem] border border-border bg-canvas-muted/70 p-8 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Vil du sette opp gaveavtale?</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-muted md:text-lg">
          Ta kontakt med oss på e-post, så hjelper vi deg raskt i gang med den løsningen
          som passer best for deg.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className={buttonVariants("primary")} href="mailto:hello@bykirken.no">
            Kontakt på e-post
          </a>
          <TrackedLink
            href="/kontakt"
            eventName="cta_click"
            eventPayload={{ location: "give_bottom", target: "/kontakt" }}
            className={buttonVariants("secondary")}
          >
            Se kontaktinfo
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
