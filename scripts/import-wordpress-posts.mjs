import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const splitIndex = line.indexOf("=");
    if (splitIndex < 0) {
      continue;
    }

    const key = line.slice(0, splitIndex).trim();
    const value = line.slice(splitIndex + 1).trim().replace(/^"(.*)"$/, "$1");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function getArg(name, fallback = null) {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  if (!value) {
    return fallback;
  }
  return value.slice(prefix.length);
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#8211;/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "...")
    .replace(/&#038;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function htmlToText(value = "") {
  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

loadDotEnvLocal();

const dryRun = hasFlag("dry-run");
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WP_BASE_URL = process.env.WP_BASE_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

if (!dryRun && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}
if (!WP_BASE_URL) {
  throw new Error("Missing WP_BASE_URL");
}

const limit = Number(getArg("limit", "20"));
const page = Number(getArg("page", "1"));

if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
  throw new Error("Invalid --limit value. Use 1-100.");
}
if (!Number.isFinite(page) || page < 1) {
  throw new Error("Invalid --page value. Use >= 1.");
}

const baseUrl = WP_BASE_URL.replace(/\/$/, "");
const endpoint = `${baseUrl}/wp-json/wp/v2/posts?per_page=${limit}&page=${page}&_embed`;
const headers = {};

if (WP_USERNAME && WP_APP_PASSWORD) {
  const token = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64");
  headers.Authorization = `Basic ${token}`;
}

console.log(`Fetching: ${endpoint}`);
const response = await fetch(endpoint, { headers });

if (!response.ok) {
  const body = await response.text();
  throw new Error(`WordPress API failed (${response.status}): ${body}`);
}

const posts = await response.json();
if (!Array.isArray(posts)) {
  throw new Error("Unexpected response from WordPress API.");
}

const rows = posts.map((post) => {
  const status = post.status === "publish" ? "published" : "draft";
  const publishedAt = post.date_gmt || post.date || null;

  return {
    slug: post.slug,
    title: { no: htmlToText(post.title?.rendered || "Untitled"), en: null },
    excerpt: { no: htmlToText(post.excerpt?.rendered || ""), en: null },
    content_md: { no: htmlToText(post.content?.rendered || ""), en: null },
    status,
    published_at: status === "published" ? publishedAt : null,
    cover_image_path: null,
  };
});

console.log(`Fetched ${posts.length} post(s).`);
if (!rows.length) {
  console.log("No posts to import.");
  process.exit(0);
}

console.log(`Prepared ${rows.length} row(s) for import.`);
console.log(`Sample: ${rows[0].slug} (${rows[0].status})`);

if (dryRun) {
  console.log("Dry run enabled. No database writes were performed.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { error } = await supabase.from("posts").upsert(rows, { onConflict: "slug" });
if (error) {
  throw new Error(`Supabase upsert failed: ${error.message}`);
}

console.log(`Upserted ${rows.length} post(s) into Supabase.`);
