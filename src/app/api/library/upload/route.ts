import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getStorageProvider } from "@/lib/storage"
import { processMediaAudio } from "@/lib/media/processor"
import prisma from "@/lib/prisma"
import crypto from "crypto"

// We are generating our own random UUIDs instead of the client payload
const generateId = () => crypto.randomUUID().replace(/-/g, "")

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get("audio") as File
    const srtFile = formData.get("srt") as File
    const title = formData.get("title") as string

    if (!audioFile || !srtFile || !title) {
      return NextResponse.json({ error: "Missing required fields: audio, srt, title" }, { status: 400 })
    }

    const storage = getStorageProvider()
    const randomPrefix = generateId().substring(0, 8)

    // Parse files to Buffers
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const srtBuffer = Buffer.from(await srtFile.arrayBuffer())

    // Upload files locally
    const audioFilename = `${randomPrefix}_${audioFile.name}`
    const srtFilename = `${randomPrefix}_${srtFile.name}`

    const audioUrl = await storage.uploadFile(audioBuffer, audioFilename, audioFile.type)
    const srtUrl = await storage.uploadFile(srtBuffer, srtFilename, srtFile.type)

    // Insert Media into Database
    const media = await prisma.media.create({
      data: {
        userId: session.user.id,
        title: title,
        sourceUrl: audioUrl,
        srtUrl: srtUrl
      }
    })

    // Trigger Media Processing Engine asynchronously
    // We intentionally don't await this so the user gets a fast upload response
    processMediaAudio(media.id).catch(err => {
      console.error(`Failed background processing for media ${media.id}:`, err)
    })

    return NextResponse.json({ success: true, media })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
