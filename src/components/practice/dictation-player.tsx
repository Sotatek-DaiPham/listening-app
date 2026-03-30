"use client"

import { useEffect, useRef, useState, MouseEvent } from "react"
import { clsx } from "clsx"

interface DictationPlayerProps {
  audioUrl: string
  onComplete?: () => void
}

export function DictationPlayer({ audioUrl, onComplete }: DictationPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    // Keyboard shortcut (Tab) to replay current audioclip.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.ctrlKey) {
        e.preventDefault()
        replay()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto-play when the audio URL changes (user advanced to next segment)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setProgress(0)
      audioRef.current.play().catch(e => {
        console.log("Playback prevented by browser until user interaction.", e)
      })
    }
  }, [audioUrl])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const replay = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    setProgress(0)
    audioRef.current.play()
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const total = audioRef.current.duration
    setCurrentTime(current)
    if (total > 0) {
      setProgress((current / total) * 100)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickedValue = (x / rect.width) * duration
    audioRef.current.currentTime = clickedValue
    setCurrentTime(clickedValue)
    setProgress((clickedValue / duration) * 100)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const m = Math.floor(time / 60)
    const s = Math.floor(time % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl flex flex-col items-center gap-4 transition-all duration-300">
      <div className="w-full flex justify-between items-center mb-2 px-2">
        <h2 className="text-slate-200 text-sm tracking-widest uppercase font-semibold">Active Segment</h2>
        <div className="text-xs text-slate-400 font-mono flex gap-1">
          <span className="text-slate-300">{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Progress timeline scrubber */}
      <div 
        className="w-full h-8 flex items-center cursor-pointer group px-2 -mt-2 -mb-2"
        onClick={handleSeek}
      >
        <div className="w-full bg-slate-700/60 rounded-full h-2 relative overflow-hidden group-hover:h-3 transition-all">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false)
          setProgress(100)
          if (onComplete) onComplete()
        }}
        className="hidden"
      />

      <div className="flex gap-4 w-full justify-center mt-2">
        <button
          onClick={replay}
          className="flex items-center justify-center p-3 sm:px-6 rounded-xl bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 transition-colors focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
          title="Replay (Ctrl+Space)"
        >
          <svg className="w-5 h-5 mr-0 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline font-medium">Replay</span>
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center justify-center py-3 px-8 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-all shadow-lg shadow-teal-500/20 active:scale-95 focus:ring-2 focus:ring-teal-400 focus:outline-none"
        >
          {isPlaying ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Listen
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-2 font-mono">Tip: Press <kbd className="bg-slate-700 px-1 py-0.5 rounded text-teal-300">Ctrl</kbd> + <kbd className="bg-slate-700 px-1 py-0.5 rounded text-teal-300">Space</kbd> to quickly replay.</p>
    </div>
  )
}
