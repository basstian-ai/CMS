"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { UrlObject } from "url";

import { trackPublicUiEvent, type PublicUiEvent } from "@/lib/analytics/track";

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string | UrlObject;
  eventName?: PublicUiEvent;
  eventPayload?: Record<string, string | number | boolean | null | undefined>;
};

export function TrackedLink({
  href,
  eventName,
  eventPayload,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      href={href as ComponentProps<typeof Link>["href"]}
      {...props}
      onClick={(event) => {
        if (eventName) {
          trackPublicUiEvent(eventName, eventPayload);
        }

        onClick?.(event);
      }}
    />
  );
}
