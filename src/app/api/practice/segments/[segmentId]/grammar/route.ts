import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeGrammar } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { segmentId: string } }
) {
  try {
    const { segmentId } = await params;
    console.log("Grammar analysis requested for segment:", segmentId);

    // 1. Check if analysis already exists
    // @ts-ignore
    const segment = await (prisma.segment || prisma['segment']).findUnique({
      where: { id: segmentId },
      select: { 
        text: true, 
        grammarAnalysis: true,
        mediaId: true,
        startTime: true,
        media: {
          select: { title: true }
        }
      }
    });

    if (!segment) {
      console.error("Segment not found in DB:", segmentId);
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    if (segment.grammarAnalysis) {
      console.log("Grammar analysis found in cache.");
      return NextResponse.json({ analysis: segment.grammarAnalysis });
    }

    // 2. Fetch context (10 segments before and 10 after) for better AI understanding
    console.log("Fetching script context for media:", segment.mediaId);
    const [beforeSegments, afterSegments] = await Promise.all([
      // @ts-ignore
      (prisma.segment || prisma['segment']).findMany({
        where: { mediaId: segment.mediaId, startTime: { lt: segment.startTime } },
        orderBy: { startTime: 'desc' },
        take: 10,
        select: { text: true }
      }),
      // @ts-ignore
      (prisma.segment || prisma['segment']).findMany({
        where: { mediaId: segment.mediaId, startTime: { gt: segment.startTime } },
        orderBy: { startTime: 'asc' },
        take: 10,
        select: { text: true }
      })
    ]);

    const fullContext = [
      ...[...beforeSegments].reverse(),
      { text: `>>> ${segment.text} <<<` }, // Highlight the current segment in context
      ...afterSegments
    ].map(s => s.text).join(" ");

    // 3. Perform analysis with full context
    console.log("Calling AI Service for enhanced analysis...");
    const analysis = await analyzeGrammar(segment.text, segment.media?.title, fullContext);
    console.log("AI response received.");

    // 4. Update database with the new analysis
    try {
      // @ts-ignore
      await (prisma.segment || prisma['segment']).update({
        where: { id: segmentId },
        data: { grammarAnalysis: analysis }
      });
    } catch (dbError) {
      console.warn("Database update failed, falling back to raw sql if needed", dbError);
      // Raw SQL fallback for environment sync issues
      await prisma.$executeRaw`UPDATE "Segment" SET "grammarAnalysis" = ${analysis} WHERE "id" = ${segmentId}`;
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Grammar Analysis API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Grammar analysis failed",
      debug: {
        hasKey: !!process.env.GOOGLE_API_KEY,
        segmentId: params.segmentId
      }
    }, { status: 500 });
  }
}
