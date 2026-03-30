import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { processMediaAudio } from "@/lib/media/processor"

export async function POST(req: NextRequest) {
  try {
    // Basic Auth Check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = await req.json()
    if (!mediaId) {
      return NextResponse.json({ error: "Missing mediaId" }, { status: 400 })
    }

    // Trigger the heavy FFmpeg Processing Engine
    const result = await processMediaAudio(mediaId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Media processed successfully",
      segmentsCreated: result.segmentsProcessed
    })

  } catch (error) {
    console.error("API Error processing media:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
