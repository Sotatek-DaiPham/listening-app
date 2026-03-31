import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { segmentId, mediaId } = await req.json()

    if (!segmentId || !mediaId) {
      return NextResponse.json({ error: "Missing segmentId or mediaId" }, { status: 400 })
    }

    // Toggle logic: Check if bookmark exists
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_segmentId: {
          userId: session.user.id,
          segmentId: segmentId,
        }
      }
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      })
      return NextResponse.json({ success: true, isBookmarked: false })
    } else {
      // Add bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          segmentId: segmentId,
          mediaId: mediaId,
        }
      })
      return NextResponse.json({ success: true, isBookmarked: true, bookmark })
    }
  } catch (error: any) {
    console.error("Failed to toggle bookmark:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all bookmarks for the current user
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        segment: true
      }
    })

    return NextResponse.json({ success: true, bookmarks })
  } catch (error: any) {
    console.error("Failed to fetch bookmarks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
