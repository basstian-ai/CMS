import Link from "next/link";

import { BodyText, Heading } from "@/components/ui/typography";

export default function NotFoundPage() {
  return (
    <section className="container-layout flex min-h-[60vh] flex-col justify-center gap-4 py-16">
      <Heading>Beklager, siden ble ikke funnet</Heading>
      <BodyText>
        Vi finner ikke siden du leter etter. Sjekk gjerne adressen eller gå tilbake
        til forsiden.
      </BodyText>
      <div>
        <Link className="text-sm font-semibold text-brand-600" href="/">
          Gå til forsiden →
        </Link>
      </div>
    </section>
  );
}
