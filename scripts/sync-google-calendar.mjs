import ical from "node-ical";
import { createClient } from "@supabase/supabase-js";

const CALENDAR_URL =
  process.env.GOOGLE_CALENDAR_ICS_URL ||
  "https://calendar.google.com/calendar/ical/kre9t9q7urd9dspgj107eoklvo%40group.calendar.google.com/public/basic.ics";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

const now = new Date();

function toSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatDateToken(date) {
  const pad = (value) => `${value}`.padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
}

function buildSlug(summary, startTime, uid) {
  const base = summary ? toSlug(summary) : "arrangement";
  if (startTime) {
    return `${base}-${formatDateToken(startTime)}`;
  }
  if (uid) {
    return `${base}-${uid.split("@")[0]}`;
  }
  return `${base}-${Date.now()}`;
}

function toIsoDate(value) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function isCancelled(event) {
  return event?.status?.toLowerCase?.() === "cancelled";
}

async function run() {
  console.log(`Fetching calendar from ${CALENDAR_URL}`);
  const calendarData = await ical.async.fromURL(CALENDAR_URL);
  const events = Object.values(calendarData).filter(
    (entry) => entry?.type === "VEVENT" && !isCancelled(entry),
  );

  const records = events.map((event) => {
    const title = event.summary?.trim() || "Arrangement";
    const description = event.description?.trim() || "";
    const startTime = toIsoDate(event.start);
    const endTime = toIsoDate(event.end);
    const slug = buildSlug(title, event.start, event.uid);

    return {
      slug,
      title: { no: title, en: title },
      description_md: {
        no: description,
        en: description,
      },
      start_time: startTime,
      end_time: endTime,
      location: event.location?.trim() || null,
      status: "published",
      published_at: now.toISOString(),
    };
  });

  if (!records.length) {
    console.log("No events found to sync.");
    return;
  }

  const { error } = await supabase
    .from("events")
    .upsert(records, { onConflict: "slug" });

  if (error) {
    throw error;
  }

  console.log(`Synced ${records.length} events.`);
}

run().catch((error) => {
  console.error("Calendar sync failed:", error);
  process.exit(1);
});
