import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 5000;

type TranslateRequestBody = {
  text?: unknown;
  sourceLanguage?: unknown;
  targetLanguage?: unknown;
};

function normalizeLanguage(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "no") {
    return "nb";
  }
  return normalized.split("-")[0];
}

async function translateWithMyMemory(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
) {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${sourceLanguage}|${targetLanguage}`);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "bykirken-cms/1.0",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    responseData?: { translatedText?: string | null };
  };
  const translated = payload.responseData?.translatedText?.trim();
  if (!translated || translated === text) {
    return null;
  }

  return translated;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TranslateRequestBody;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sourceLanguage =
      typeof body.sourceLanguage === "string"
        ? normalizeLanguage(body.sourceLanguage)
        : "";
    const targetLanguage =
      typeof body.targetLanguage === "string"
        ? normalizeLanguage(body.targetLanguage)
        : "";

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: "text, sourceLanguage and targetLanguage are required." },
        { status: 400 },
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `text exceeds max length (${MAX_TEXT_LENGTH}).` },
        { status: 413 },
      );
    }

    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({ translatedText: null });
    }

    const translatedText = await translateWithMyMemory(
      text,
      sourceLanguage,
      targetLanguage,
    );

    return NextResponse.json({ translatedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown translation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
