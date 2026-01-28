import ical from "node-ical";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CALENDAR_URL =
  process.env.GOOGLE_CALENDAR_ICS_URL ||
  "https://calendar.google.com/calendar/ical/kre9t9q7urd9dspgj107eoklvo%40group.calendar.google.com/public/basic.ics";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatDateToken(date: Date) {
  const pad = (value: number) => `${value}`.padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(
    date.getUTCDate(),
  )}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}`;
}

function buildSlug(summary: string, startTime?: Date, uid?: string) {
  const base = summary ? toSlug(summary) : "arrangement";
  if (uid) {
    return `${base}-${uid.split("@")[0]}`;
  }
  if (startTime) {
    return `${base}-${formatDateToken(startTime)}`;
  }
  return `${base}-${Date.now()}`;
}

function toIsoDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

function isCancelled(event: { status?: string | null } | null) {
  return event?.status?.toLowerCase?.() === "cancelled";
}

async function syncGoogleCalendar() {
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
  console.log(`Fetching calendar from ${CALENDAR_URL}`);

  const calendarData = await ical.async.fromURL(CALENDAR_URL);
  const events = Object.values(calendarData).filter(
    (entry) => entry?.type === "VEVENT",
  );

  const records = events.map((event) => {
    const title = event.summary?.trim() || "Arrangement";
    const description = event.description?.trim() || "";
    const startTime = toIsoDate(event.start);
    const endTime = toIsoDate(event.end);
    const slug = buildSlug(title, event.start, event.uid);
    const status = isCancelled(event) ? "cancelled" : "published";

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
      status,
      published_at: status === "published" ? now.toISOString() : null,
    };
  });

  if (!records.length) {
    return { synced: 0, cancelled: 0 };
  }

  const { error } = await supabase
    .from("events")
    .upsert(records, { onConflict: "slug" });

  if (error) {
    throw error;
  }

  const cancelledCount = records.filter(
    (record) => record.status === "cancelled",
  ).length;

  return { synced: records.length, cancelled: cancelledCount };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token =
    request.headers.get("x-cron-secret") || searchParams.get("secret");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";

  if (CRON_SECRET && token !== CRON_SECRET && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { synced, cancelled } = await syncGoogleCalendar();

    return NextResponse.json({
      ok: true,
      synced,
      cancelled,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Calendar sync failed:", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
