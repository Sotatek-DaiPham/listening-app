import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { downloadYouTubeMedia } from "@/lib/media/youtube";
import { processMediaAudio } from "@/lib/media/processor";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing YouTube URL" }, { status: 400 });
    }

    // 1. Download from YouTube
    console.log(`[API] Processing YouTube URL: ${url}`);
    const ytData = await downloadYouTubeMedia(url);

    // 2. Prepare permanent storage paths
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const finalAudioFilename = `audio_${Date.now()}.mp3`;
    const finalAudioPath = path.join(uploadDir, finalAudioFilename);
    const finalAudioUrl = `/uploads/${finalAudioFilename}`;

    let finalSrtUrl = "";
    if (ytData.srtContent) {
      const finalSrtFilename = `subs_${Date.now()}.srt`;
      const finalSrtPath = path.join(uploadDir, finalSrtFilename);
      fs.writeFileSync(finalSrtPath, ytData.srtContent);
      finalSrtUrl = `/uploads/${finalSrtFilename}`;
    }

    // Move temp audio to final destination
    fs.renameSync(ytData.audioPath, finalAudioPath);

    // 3. Create Database Record
    const media = await prisma.media.create({
      data: {
        userId: session.user.id!,
        title: ytData.title,
        sourceUrl: finalAudioUrl,
        srtUrl: finalSrtUrl || null,
        status: "PROCESSING",
      },
    });

    console.log(`[API] Media created: ${media.id}. Starting processing engine...`);

    // 4. Trigger Processing Engine (Non-blocking)
    // In a real production app, this should be a background job.
    // In our Next.js dev env, we can await it or fire and forget.
    // We await for better feedback in this demo, but it might timeout for long videos.
    processMediaAudio(media.id).catch((err) => {
      console.error(`[API] Background processing failed for ${media.id}:`, err);
    });

    return NextResponse.json({
      message: "YouTube media added successfully",
      mediaId: media.id,
      title: ytData.title,
    });
  } catch (error: any) {
    console.error("[API] YouTube processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process YouTube link" },
      { status: 500 }
    );
  }
}
