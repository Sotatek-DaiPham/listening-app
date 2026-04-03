import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { translateToVietnamese } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { segmentId: string } }
) {
  try {
    const { segmentId } = await params;
    console.log("Translation requested for segment:", segmentId);

    // 1. Check if translation already exists
    // @ts-ignore
    const segment = await (prisma.segment || prisma['segment']).findUnique({
      where: { id: segmentId },
      select: { text: true, translation: true }
    });

    if (!segment) {
      console.error("Segment not found in DB:", segmentId);
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    console.log("Segment text found:", segment.text.substring(0, 20) + "...");

    if (segment.translation) {
      console.log("Translation found in cache.");
      return NextResponse.json({ translation: segment.translation });
    }

    // 2. Perform translation if not cached
    console.log("Calling AI Service...");
    const translation = await translateToVietnamese(segment.text);
    console.log("AI response received.");

    // 3. Update database with the new translation
    // Using raw SQL fallback just in case of Prisma type lag on Windows
    try {
      await prisma.$executeRaw`UPDATE "Segment" SET "translation" = ${translation} WHERE "id" = ${segmentId}`;
    } catch (dbError) {
      console.warn("Database update via raw SQL failed, falling back to prisma client", dbError);
      // @ts-ignore
      await (prisma.segment || prisma['segment']).update({
        where: { id: segmentId },
        data: { translation }
      });
    }

    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error("Translation API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Translation failed",
      debug: {
        hasKey: !!process.env.GOOGLE_API_KEY,
        segmentId: params.segmentId
      }
    }, { status: 500 });
  }
}
