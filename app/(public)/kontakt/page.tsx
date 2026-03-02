import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";

const contactItems = [
  {
    title: "E-post",
    value: "hello@bykirken.no",
    href: "mailto:hello@bykirken.no",
  },
  {
    title: "Adresse",
    value: "Storgata 1, 0001 Oslo",
    href: "https://maps.google.com/?q=Storgata+1,+Oslo",
  },
  {
    title: "Sosiale medier",
    value: "Instagram, Facebook og Spotify",
    href: "/",
  },
] as const;

export default function ContactPage() {
  return (
    <section className="container-layout space-y-10 py-14 md:py-16">
      <header className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
          Kontakt
        </p>
        <h1 className="font-display text-4xl text-ink md:text-5xl">Vi hører gjerne fra deg</h1>
        <p className="text-base leading-relaxed text-ink-muted md:text-lg">
          Har du spørsmål om menigheten, arrangementer eller hvordan du kan bli
          med? Send oss en melding eller besøk oss i sentrum.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {contactItems.map((item) => (
          <article key={item.title} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
              {item.title}
            </p>
            <p className="mt-3 text-lg text-ink">{item.value}</p>
            {item.href.startsWith("/") ? (
              <TrackedLink
                href={item.href}
                eventName="cta_click"
                eventPayload={{ location: "contact_card", target: item.href, label: item.title }}
                className={`${buttonVariants("ghost")} mt-4`}
              >
                Se mer
              </TrackedLink>
            ) : (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className={`${buttonVariants("ghost")} mt-4 inline-flex`}
              >
                Åpne
              </a>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-[2rem] border border-border bg-canvas-muted/70 p-8 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Besøk oss på søndag</h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-muted md:text-lg">
          Vi anbefaler at du sjekker kalenderen for oppdaterte tider. Kom gjerne
          litt for start for a finne plass og bli kjent med folk.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TrackedLink
            href="/kalender"
            eventName="cta_click"
            eventPayload={{ location: "contact_bottom", target: "/kalender" }}
            className={buttonVariants("primary")}
          >
            Se kalender
          </TrackedLink>
          <TrackedLink
            href="/om-oss"
            eventName="cta_click"
            eventPayload={{ location: "contact_bottom", target: "/om-oss" }}
            className={buttonVariants("secondary")}
          >
            Les om Bykirken
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
