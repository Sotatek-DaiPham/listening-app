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
}

export function PracticeClient({ mediaId, mediaTitle, segments, initialIndex = 0, progressPercent = 0, completedSegmentIds = [] }: PracticeClientProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [completedList, setCompletedList] = useState<Set<string>>(new Set(completedSegmentIds))
  const [isCurrentSegmentMastered, setIsCurrentSegmentMastered] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Reset mastered state when segment changes
  useEffect(() => {
    setIsCurrentSegmentMastered(false)
    setGrammarAnalysis(null)
    setIsAnalyzing(false)
  }, [currentIndex])

  const currentSegment = segments[currentIndex]
  const isFinished = currentIndex >= segments.length

  const handleSuccess = async () => {
    // Optimistically update the completed list
    setCompletedList(prev => new Set(prev).add(currentSegment.id))
    
    // ... (rest of handleSuccess)

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
    <div className="w-full flex flex-col items-center z-10">
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
          
          <div className="w-full mb-4 flex justify-center items-center text-slate-400 text-sm font-semibold tracking-wider uppercase relative">
            
            {completedList.has(currentSegment.id) ? (
              <div className="absolute left-0 sm:left-auto sm:right-[50%] sm:mr-32 flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded border border-emerald-400/20 shadow-sm transition-all">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                <span className="hidden sm:inline text-[10px] tracking-widest mt-[1px]">MASTERED</span>
              </div>
            ) : null}

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
              <span className="min-w-[4rem] text-center">{currentIndex + 1} / {segments.length}</span>
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
            <span className="hidden sm:flex items-center gap-2 absolute right-0">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Focus Mode
            </span>
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
                        className="flex items-center px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95"
                      >
                        Next Segment
                        <svg className="w-3.5 h-3.5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
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
    </div>
  )
}
