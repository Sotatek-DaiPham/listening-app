import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PracticeClient } from "@/components/practice/practice-client"

export default async function PracticeArenaPage(props: { params: Promise<{ mediaId: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const resolvedParams = await props.params
  const mediaId = resolvedParams.mediaId

  // Fetch true media data with its sliced segments and user progress
  // @ts-ignore - Prisma client types are out of sync in this env but valid at runtime
  const media = await prisma.media.findUnique({
    where: { 
      id: mediaId,
      userId: session.user.id 
    },
    include: {
      segments: {
        orderBy: { startTime: 'asc' }
      },
      progress: {
        where: { isCompleted: true }
      }
    }
  })

  if (!media) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
        <div className="text-center bg-slate-800 p-8 rounded-2xl max-w-md">
          <h2 className="text-2xl font-bold mb-4">Media Not Found</h2>
          <p className="text-slate-400 mb-6">This media file does not exist or you do not have permission to access it.</p>
          <a href="/library" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4">Return to Library</a>
        </div>
      </div>
    )
  }

  // @ts-ignore
  if (media.status === 'PROCESSING' || media.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
        <div className="text-center bg-slate-800 p-8 rounded-2xl max-w-md">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 2" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Still Processing</h2>
          <p className="text-slate-400 mb-6">
            We're currently slicing this audio file into segments. This usually takes less than a minute.
          </p>
          <a href="/library" className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all">
            Back to Library
          </a>
        </div>
      </div>
    )
  }

  // @ts-ignore
  if (media.status === 'FAILED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4">
        <div className="text-center bg-slate-800 p-8 rounded-2xl max-w-md border border-red-500/20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing Failed</h2>
          <p className="text-slate-400 mb-6 text-sm">
            {/* @ts-ignore */}
            {media.errorMessage || "An unexpected error occurred while processing this media file. Please try uploading again."}
          </p>
          <a href="/library" className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all">
            Return to Library
          </a>
        </div>
      </div>
    )
  }

  // Automatically compute where the user left off
  const completedSegmentIds = new Set(media.progress.map((p: any) => p.segmentId))
  let calculatedInitialIndex = media.segments.findIndex((s: any) => !completedSegmentIds.has(s.id))
  // If they have completed all segments, restart from 0
  if (calculatedInitialIndex === -1) {
    calculatedInitialIndex = 0
  }

  const totalSegments = media.segments.length
  const progressPercent = totalSegments > 0 ? Math.round((completedSegmentIds.size / totalSegments) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col selection:bg-teal-500/30">
      <header className="w-full flex items-center justify-between px-6 py-4 shrink-0 relative z-20 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-sm">
        <div className="w-24 shrink-0">
          <a 
            href="/library" 
            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Library</span>
          </a>
        </div>

        <div className="text-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
            The Focused Lexicon
          </h1>
        </div>

        {/* Empty div to balance Flexbox between left and right */}
        <div className="w-24 shrink-0"></div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-start z-10 p-4 lg:p-8 pt-6 lg:pt-10">
        <PracticeClient 
          mediaId={media.id} 
          mediaTitle={media.title}
          initialIndex={calculatedInitialIndex}
          progressPercent={progressPercent}
          completedSegmentIds={Array.from(completedSegmentIds) as string[]}
          segments={media.segments.map((s: any) => ({
            id: s.id,
            audioUrl: s.audioUrl,
            text: s.text
          }))} 
        />
      </main>

      {/* Decorative gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.03)_0%,transparent_100%)] mix-blend-screen" />
    </div>
  )
}
