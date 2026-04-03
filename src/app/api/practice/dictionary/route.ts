import { NextRequest, NextResponse } from "next/server";
import { getWordDefinition } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { word, context, mediaTitle } = await req.json();

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    const definition = await getWordDefinition(word, context, mediaTitle);

    return NextResponse.json({ definition });
  } catch (error: any) {
    console.error("Dictionary API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch word definition" },
      { status: 500 }
    );
  }
}
