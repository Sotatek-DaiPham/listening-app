"use client"

import { useState, useEffect } from "react"
import { DictationPlayer } from "./dictation-player"
import { DictationInput } from "./dictation-input"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

interface Segment {
  id: string
  audioUrl: string
  text: string
}

interface PracticeClientProps {
  mediaId: string
  mediaTitle: string
  segments: Segment[]
  initialIndex?: number
  progressPercent?: number
  completedSegmentIds?: string[]
  bookmarkedSegmentIds?: string[]
}

export function PracticeClient({ 
  mediaId, 
  mediaTitle, 
  segments, 
  initialIndex = 0, 
  progressPercent = 0, 
  completedSegmentIds = [],
  bookmarkedSegmentIds = []
}: PracticeClientProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [completedList, setCompletedList] = useState<Set<string>>(new Set(completedSegmentIds))
  const [bookmarkedList, setBookmarkedList] = useState<Set<string>>(new Set(bookmarkedSegmentIds))
  const [isCurrentSegmentMastered, setIsCurrentSegmentMastered] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Reset mastered state when segment changes
  useEffect(() => {
    setIsCurrentSegmentMastered(false)
    setGrammarAnalysis(null)
    setIsAnalyzing(false)
  }, [currentIndex])

  // Global keydown listener for Enter key to go to next segment
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isCurrentSegmentMastered) {
        e.preventDefault()
        handleSuccess()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isCurrentSegmentMastered, currentIndex]) 

  const currentSegment = segments[currentIndex]
  const isFinished = currentIndex >= segments.length

  const handleToggleBookmark = async () => {
    const isBookmarked = bookmarkedList.has(currentSegment.id)
    
    // Optimistic UI update
    setBookmarkedList(prev => {
      const next = new Set(prev)
      if (isBookmarked) next.delete(currentSegment.id)
      else next.add(currentSegment.id)
      return next
    })

    try {
      await fetch('/api/practice/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          segmentId: currentSegment.id,
          mediaId: mediaId
        })
      })
    } catch (e) {
      console.error('Failed to toggle bookmark', e)
      // Revert on error
      setBookmarkedList(prev => {
        const next = new Set(prev)
        if (isBookmarked) next.add(currentSegment.id)
        else next.delete(currentSegment.id)
        return next
      })
    }
  }

  const handleSuccess = async () => {
    // Optimistically update the completed list
    setCompletedList(prev => new Set(prev).add(currentSegment.id))

    try {
      await fetch('/api/practice/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId: mediaId,
          segmentId: currentSegment.id,
          isCompleted: true,
          attempts: 1
        })
      })
    } catch (e) {
      console.error('Failed to log progress', e)
    }

    setCurrentIndex((prev) => prev + 1)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
  }

  const handleSkip = () => {
    setCurrentIndex(prev => Math.min(prev + 1, segments.length))
  }

  const handleAnalyzeGrammar = async () => {
    if (isAnalyzing || grammarAnalysis) return

    setIsAnalyzing(true)
    try {
      const res = await fetch(`/api/practice/segments/${currentSegment.id}/grammar`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.analysis) {
        setGrammarAnalysis(data.analysis)
      }
    } catch (e) {
      console.error('Failed to analyze grammar', e)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (segments.length === 0) {
    return (
      <div className="text-center bg-slate-800/80 p-12 rounded-3xl border border-slate-700/50 shadow-2xl z-20 border-amber-500/20">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-500 flex items-center justify-center rounded-full mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">No Dialogue Found</h2>
        <p className="text-slate-400 mb-8">This media file was processed successfully but no subtitle segments were found.</p>
        <Link
          href="/library"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
        >
          Return to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center z-10 relative">
      {!isFinished ? (
        <>
          <div className="w-full mb-2 flex flex-col items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-wide capitalize border-b border-slate-700/50 pb-2 inline-block px-8 max-w-full truncate mb-3" title={mediaTitle}>
              {mediaTitle}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-48 sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-teal-400 tabular-nums">{progressPercent}%</span>
            </div>
          </div>

          <div className="w-full mb-4 flex justify-between items-center text-slate-400 text-sm font-semibold tracking-wider uppercase relative">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:text-teal-400 transition-all active:scale-95 group relative shadow-md"
                title="Saved Sentences"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {bookmarkedList.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[9px] flex items-center justify-center rounded-full border border-slate-900 font-bold shadow-lg animate-pulse">
                    {bookmarkedList.size}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50 shadow-inner">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="p-1 hover:text-teal-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                title="Previous Segment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="min-w-[4rem] text-center font-mono">{currentIndex + 1} / {segments.length}</span>
              <button
                onClick={handleSkip}
                className="p-1 hover:text-teal-400 transition-colors"
                title="Skip Segment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {completedList.has(currentSegment.id) && (
                <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-md border border-emerald-400/20 shadow-sm transition-all text-[10px] font-bold tracking-widest">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span>MASTERED</span>
                </div>
              )}
              <button 
                onClick={handleToggleBookmark}
                className={`p-2 rounded-lg border transition-all active:scale-90 ${
                  bookmarkedList.has(currentSegment.id) 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-rose-400 hover:border-rose-400/30'
                }`}
                title="Bookmark this favorite sentence"
              >
                <svg 
                  className={`w-5 h-5 transition-transform ${bookmarkedList.has(currentSegment.id) ? 'scale-110' : ''}`} 
                  fill={bookmarkedList.has(currentSegment.id) ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-2">
            <div className="flex flex-col gap-6">
              <DictationInput
                key={currentSegment.id}
                segmentId={currentSegment.id}
                correctText={currentSegment.text}
                onSuccess={handleSuccess}
                onStateChange={setIsCurrentSegmentMastered}
              />
            </div>

            <div className="flex flex-col gap-4">
              <DictationPlayer audioUrl={currentSegment.audioUrl} />

              {/* Relocated Next Button Section */}
              {isCurrentSegmentMastered && (
                <div className="flex flex-col gap-3">
                  <div className="w-full flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-300 shadow-sm mt-2">
                    <div className="flex items-center text-emerald-400 font-bold uppercase tracking-tight text-[11px] px-2 italic opacity-90">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Perfect Match!
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAnalyzeGrammar}
                        disabled={isAnalyzing}
                        className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-teal-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analyzing...
                          </span>
                        ) : "Analyze Grammar"}
                      </button>
                      <button
                        onClick={handleSuccess}
                        className="flex items-center px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95 group"
                      >
                        Next Segment
                        <span className="ml-2 text-[8px] bg-slate-900/20 px-1 rounded border border-slate-900/10 opacity-70 group-hover:opacity-100 transition-opacity">ENTER</span>
                        <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Original Sentence Display */}
                  <div className="w-full p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Original Sentence
                    </h4>
                    <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed italic decoration-teal-500/30 underline-offset-8">
                      "{currentSegment.text}"
                    </p>
                  </div>

                  {grammarAnalysis && (
                    <div className="w-full p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                      <h4 className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Phân tích ngữ pháp
                      </h4>
                      <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                            li: ({ children }) => <li className="marker:text-teal-500/50">{children}</li>,
                            strong: ({ children }) => <strong className="text-teal-400 font-bold">{children}</strong>,
                          }}
                        >
                          {grammarAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center bg-slate-800/80 p-12 rounded-3xl border border-slate-700/50 shadow-2xl z-20 relative">
          <div className="w-20 h-20 bg-teal-500/20 text-teal-400 flex items-center justify-center rounded-full mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-100 mb-2">Exercise Complete</h2>
          <p className="text-slate-400 text-lg mb-8">You successfully dictated all segments for this media.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors border border-slate-600"
            >
              Restart Exercise
            </button>
            <Link
              href="/library"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-teal-500/20"
            >
              Back to Library
            </Link>
          </div>
        </div>
      )}

      {/* Favorites Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-slate-900 border-r border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500 fill-current" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Favorites
            </h3>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {segments.filter(s => bookmarkedList.has(s.id)).length > 0 ? (
              segments.filter(s => bookmarkedList.has(s.id)).map((s, idx) => {
                const segmentIndex = segments.findIndex(seg => seg.id === s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentIndex(segmentIndex)
                      setIsSidebarOpen(false)
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all group ${
                      currentIndex === segmentIndex 
                      ? "bg-teal-500/10 border-teal-500/30 ring-1 ring-teal-500/20" 
                      : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-teal-500 tracking-widest uppercase">Segment #{segmentIndex + 1}</span>
                      <div className="flex items-center gap-2">
                        {completedList.has(s.id) && (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4 opacity-50">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-400">No favorite sentences yet. Click the heart to bookmark.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
