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
  const [volume, setVolume] = useState(1.0)
  const [duration, setDuration] = useState(0)

  // Initialize volume from localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem("practice-volume")
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume)
      setVolume(v)
      if (audioRef.current) audioRef.current.volume = v
    }
  }, [])

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Replay (Ctrl+Space)
      if (e.code === "Space" && e.ctrlKey) {
        e.preventDefault()
        replay()
      }
      
      // Volume controls (Up/Down arrows)
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setVolume(prev => {
          const newVol = Math.min(prev + 0.1, 1)
          if (audioRef.current) audioRef.current.volume = newVol
          localStorage.setItem("practice-volume", newVol.toString())
          return newVol
        })
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setVolume(prev => {
          const newVol = Math.max(prev - 0.1, 0)
          if (audioRef.current) audioRef.current.volume = newVol
          localStorage.setItem("practice-volume", newVol.toString())
          return newVol
        })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Auto-play when the audio URL changes (user advanced to next segment)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.volume = volume
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value)
    setVolume(newVol)
    if (audioRef.current) audioRef.current.volume = newVol
    localStorage.setItem("practice-volume", newVol.toString())
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
      audioRef.current.volume = volume
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

      <div className="flex flex-col sm:flex-row gap-6 w-full items-center justify-between mt-2 px-2">
        <div className="flex gap-3 items-center">
          <button
            onClick={replay}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 transition-colors focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
            title="Replay (Ctrl+Space)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="flex items-center justify-center py-3 px-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-teal-500/20 active:scale-95 focus:ring-2 focus:ring-teal-400 focus:outline-none"
          >
            {isPlaying ? "Pause" : "Listen"}
          </button>
        </div>

        {/* Volume Control Slider */}
        <div className="flex items-center gap-3 bg-slate-700/20 px-4 py-2 rounded-xl border border-slate-700/50 flex-1 max-w-[240px]">
          <div className="text-slate-400">
            {volume === 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            ) : volume < 0.5 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
            title="Adjust Volume (Arrow Up/Down)"
          />
          <span className="text-[10px] font-mono text-slate-400 min-w-[2.5rem] text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1 mt-1">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
          Shortcuts: <span className="text-teal-500/70">Ctrl+Space</span> Replay • <span className="text-teal-500/70">↑/↓</span> Volume
        </p>
      </div>
    </div>
  )
}
