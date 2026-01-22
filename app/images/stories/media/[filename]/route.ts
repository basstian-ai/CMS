import { NextResponse } from "next/server";

import { createSupabasePublicClient } from "@/lib/supabase/server";

type RouteParams = {
  params: {
    filename: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const filename = params.filename;
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("sermons")
    .select("audio_path")
    .eq("filename", filename)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Failed to load sermon." }, { status: 500 });
  }

  if (!data?.audio_path) {
    return NextResponse.json({ error: "Sermon not found." }, { status: 404 });
  }

  const { data: audioData } = supabase.storage
    .from("podcasts")
    .getPublicUrl(data.audio_path);

  if (!audioData.publicUrl) {
    return NextResponse.json({ error: "Audio not found." }, { status: 404 });
  }

  return NextResponse.redirect(audioData.publicUrl, { status: 307 });
}
