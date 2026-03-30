import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId, segmentId, isCompleted, attempts } = await req.json()

    if (!mediaId || !segmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upsert the user progress metric
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_segmentId: {
          userId: session.user.id,
          segmentId: segmentId,
        }
      },
      update: {
        isCompleted: isCompleted,
        attempts: {
          increment: attempts || 1
        }
      },
      create: {
        userId: session.user.id,
        mediaId: mediaId,
        segmentId: segmentId,
        isCompleted: isCompleted || false,
        attempts: attempts || 1
      }
    })

    return NextResponse.json({ success: true, progress })
  } catch (error: any) {
    console.error("Failed to post progress:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
