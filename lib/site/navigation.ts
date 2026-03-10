import type { Route } from "next";

export type PublicNavItem = {
  href: Route;
  label: string;
  description: string;
};

export const publicNavItems: PublicNavItem[] = [
  {
    href: "/",
    label: "Hjem",
    description: "Tilbake til forsiden",
  },
  {
    href: "/kalender",
    label: "Kalender",
    description: "Kommende samlinger og arrangementer",
  },
  {
    href: "/nyheter",
    label: "Nyheter",
    description: "Siste oppdateringer fra menigheten",
  },
  {
    href: "/podcast",
    label: "Podcast",
    description: "Taler og episoder",
  },
  {
    href: "/om-oss",
    label: "Om oss",
    description: "Historie, verdier og retning",
  },
  {
    href: "/kontakt",
    label: "Kontakt",
    description: "Ta kontakt med teamet",
  },
];

export const publicPrimaryCta = {
  href: "/gi" as Route,
  label: "Gi",
  description: "Støtt arbeidet",
};

export function isNavItemActive(pathname: string, href: Route) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
