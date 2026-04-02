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

    // 2. Perform analysis if not cached
    console.log("Calling Gemini AI for analysis with context:", segment.media?.title);
    const analysis = await analyzeGrammar(segment.text, segment.media?.title);
    console.log("Gemini response received.");

    // 3. Update database with the new analysis
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
