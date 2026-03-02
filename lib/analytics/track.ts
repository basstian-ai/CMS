export type PublicUiEvent =
  | "cta_click"
  | "nav_click"
  | "card_click"
  | "language_switch";

type PublicEventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    va?: (
      command: "event",
      eventName: PublicUiEvent,
      payload?: Record<string, string | number | boolean>,
    ) => void;
  }
}

function normalizePayload(payload: PublicEventPayload) {
  const normalized: Record<string, string | number | boolean> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    normalized[key] = value;
  });

  return normalized;
}

export function trackPublicUiEvent(
  eventName: PublicUiEvent,
  payload: PublicEventPayload = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.va !== "function") {
    return;
  }

  window.va("event", eventName, normalizePayload(payload));
}
