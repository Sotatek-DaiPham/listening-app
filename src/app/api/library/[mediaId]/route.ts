import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getStorageProvider } from "@/lib/storage"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const mediaId = resolvedParams.mediaId

    // 1. Fetch the media to get file URLs and check ownership
    let media: any = null
    try {
      // @ts-ignore
      media = await (prisma.media || prisma['media']).findUnique({
        where: { id: mediaId },
        include: {
          segments: {
            select: { audioUrl: true }
          }
        }
      })
    } catch (e) {
      // Fallback to raw query if types are broken
      const raw: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM "Media" WHERE id = '${mediaId}' LIMIT 1`)
      media = raw[0]
      if (media) {
        media.segments = await prisma.$queryRawUnsafe(`SELECT "audioUrl" FROM "Segment" WHERE "mediaId" = '${mediaId}'`)
      }
    }

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (media.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const storage = getStorageProvider()

    // 2. Delete all segment audio files
    const segments = media.segments || []
    for (const segment of segments) {
      if (segment.audioUrl) {
        await storage.deleteFile(segment.audioUrl).catch(err => 
          console.error(`[Delete] Failed to delete segment file ${segment.audioUrl}:`, err)
        )
      }
    }

    // 3. Delete source audio and SRT files
    if (media.sourceUrl) {
      await storage.deleteFile(media.sourceUrl).catch(err => 
        console.error(`[Delete] Failed to delete source file ${media.sourceUrl}:`, err)
      )
    }

    if (media.srtUrl) {
      await storage.deleteFile(media.srtUrl).catch(err => 
        console.error(`[Delete] Failed to delete SRT file ${media.srtUrl}:`, err)
      )
    }

    // 4. Delete the Media record (Cascade will handle Segment and UserProgress rows in DB)
    try {
      // @ts-ignore
      await (prisma.media || prisma['media']).delete({
        where: { id: mediaId }
      })
    } catch (e) {
      console.warn(`[Delete] Prisma delete failed, using raw SQL.`)
      await prisma.$executeRawUnsafe(`DELETE FROM "Media" WHERE id = '${mediaId}'`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title } = await req.json()
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }

    const resolvedParams = await params
    const mediaId = resolvedParams.mediaId

    // 1. Check ownership
    let media: any = null
    try {
      // @ts-ignore
      media = await (prisma.media || prisma['media']).findUnique({
        where: { id: mediaId },
        select: { userId: true }
      })
    } catch (e) {
      const raw: any[] = await prisma.$queryRawUnsafe(`SELECT "userId" FROM "Media" WHERE id = '${mediaId}' LIMIT 1`)
      media = raw[0]
    }

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (media.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 2. Update the Title
    try {
      // @ts-ignore
      await (prisma.media || prisma['media']).update({
        where: { id: mediaId },
        data: { title }
      })
    } catch (e) {
      console.warn(`[Update] Prisma update failed, using raw SQL.`)
      await prisma.$executeRawUnsafe(
        `UPDATE "Media" SET "title" = '${title.replace(/'/g, "''")}', "updatedAt" = NOW() WHERE id = '${mediaId}'`
      )
    }

    return NextResponse.json({ success: true, title })
  } catch (error: any) {
    console.error("Update error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
