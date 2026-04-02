import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/auth-buttons"
import { DeleteMediaButton } from "@/components/library/delete-media-button"
import { EditMediaButton } from "@/components/library/edit-media-button"
import { YoutubeImportCard } from "@/components/library/youtube-import-card"

export default async function LibraryPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/")
  }

  // Fetch all media items for the current user across the application
  const mediaList = await prisma.media.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      segments: {
        select: { id: true } // just counting them
      },
      progress: {
        where: { isCompleted: true } // Counting completed segments
      }
    }
  })

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">My Library</h1>
            <p className="text-slate-400 mt-2">Manage your audio dictation collection.</p>
          </div>
          <div className="flex items-center gap-4">
            <SignOutButton />
            <Link 
              href="/library/upload" 
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              New Media
            </Link>
          </div>
        </header>

        <YoutubeImportCard />

        {mediaList.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-800/30">
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Your library is empty</h3>
            <p className="text-slate-500 mb-6">Upload an MP3/SRT file or paste a YouTube link to start practicing.</p>
            <Link href="/library/upload" className="font-medium text-teal-400 hover:text-teal-300">
              Upload now &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaList.map((m) => {
              // Defensive logic: even if status is PENDING/PROCESSING, if all segments are done, it's COMPLETED
              // @ts-ignore
              const status = m.status || 'COMPLETED'
              // @ts-ignore
              const totalSegments = m.totalSegments || m.segments.length
              // @ts-ignore
              const processedSegments = m.processedSegments || 0
              const completedSegmentsCount = m.progress.length

              // Robust Completion Check: an item is only processing if it says so AND it actually has pending segments
              const isCompletedActually = status === 'COMPLETED' || (totalSegments > 0 && processedSegments === totalSegments)
              const isProcessing = (status === 'PROCESSING' || status === 'PENDING') && !isCompletedActually
              const isFailed = status === 'FAILED'
              const isCompleted = isCompletedActually && !isFailed
              
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
              const isStuck = isProcessing && new Date(m.updatedAt) < fiveMinutesAgo

              const processingPercentage = totalSegments > 0 ? Math.round((processedSegments / totalSegments) * 100) : 0
              const masteryPercentage = totalSegments > 0 ? Math.round((completedSegmentsCount / totalSegments) * 100) : 0

              return (
                <div key={m.id} className="group relative h-full bg-slate-800 border border-slate-700 rounded-2xl transition-all hover:border-teal-500/50 shadow-lg hover:shadow-teal-500/10">
                  {/* Invisible Full-Card Link (only if completed) */}
                  {isCompleted && (
                    <Link 
                      href={`/practice/${m.id}`} 
                      className="absolute inset-0 z-0 rounded-2xl"
                      aria-label={`Practice ${m.title}`}
                    />
                  )}
                  
                  {/* Content Layer */}
                  <div className={`relative z-10 p-6 h-full flex flex-col pointer-events-none ${!isCompleted ? 'opacity-80' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-bold transition-colors line-clamp-2 pr-2 ${isCompleted ? 'text-slate-200 group-hover:text-teal-400' : 'text-slate-400'}`}>
                        {m.title}
                      </h3>
                      
                      {/* Action Buttons Layer (must be pointer-events-auto) */}
                      <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
                        {status === 'PENDING' && !isStuck && (
                          <div className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Starting...
                          </div>
                        )}
                        {status === 'PROCESSING' && !isStuck && (
                          <div className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Slicing...
                          </div>
                        )}
                        {isFailed && (
                          <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] font-bold text-red-400 uppercase tracking-wider">
                            Error
                          </div>
                        )}
                        <EditMediaButton mediaId={m.id} currentTitle={m.title} />
                        <DeleteMediaButton mediaId={m.id} mediaTitle={m.title} />
                      </div>
                    </div>

                    <div className="mt-auto">
                      {isProcessing && (
                        <div className="mt-8">
                          <div className="flex justify-between text-xs text-amber-500/80 mb-2 font-medium">
                            {totalSegments === 0 ? (
                              <span>Analyzing audio cues...</span>
                            ) : (
                              <span>Slicing audio: {processedSegments} / {totalSegments}</span>
                            )}
                            {totalSegments > 0 && <span>{processingPercentage}%</span>}
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`${totalSegments === 0 ? 'bg-cyan-500 animate-pulse' : 'bg-amber-500'} h-2 rounded-full transition-all duration-300`} 
                              style={{ width: `${totalSegments === 0 ? 100 : processingPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isFailed && (
                        <div className="mt-8">
                          <p className="text-xs text-red-400/80 italic line-clamp-2">
                            {/* @ts-ignore */}
                            {m.errorMessage || "Failed to process audio segments."}
                          </p>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-8">
                          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
                            <span>Mastery: {completedSegmentsCount} / {totalSegments} segments</span>
                            <span>{masteryPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-1000" 
                              style={{ width: `${masteryPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
