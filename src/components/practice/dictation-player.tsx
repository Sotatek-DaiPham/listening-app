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
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [duration, setDuration] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0]

  useEffect(() => {
    setIsMounted(true)
    const savedVolume = localStorage.getItem("practice-volume")
    if (savedVolume !== null) {
      const v = parseFloat(savedVolume)
      setVolume(v)
      if (audioRef.current) audioRef.current.volume = v
    }

    const savedSpeed = localStorage.getItem("practice-speed")
    if (savedSpeed !== null) {
      const s = parseFloat(savedSpeed)
      setPlaybackRate(s)
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
      
      // Speed controls ([ and ])
      if (e.key === "[") {
        e.preventDefault()
        setPlaybackRate(prev => {
          const currentIndex = speeds.indexOf(prev)
          const newSpeed = currentIndex > 0 ? speeds[currentIndex - 1] : speeds[0]
          localStorage.setItem("practice-speed", newSpeed.toString())
          return newSpeed
        })
      }
      if (e.key === "]") {
        e.preventDefault()
        setPlaybackRate(prev => {
          const currentIndex = speeds.indexOf(prev)
          const newSpeed = currentIndex < speeds.length - 1 ? speeds[currentIndex + 1] : speeds[speeds.length - 1]
          localStorage.setItem("practice-speed", newSpeed.toString())
          return newSpeed
        })
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
      audioRef.current.playbackRate = playbackRate
      setProgress(0)
      audioRef.current.play().catch(e => {
        console.log("Playback prevented by browser until user interaction.", e)
      })
    }
  }, [audioUrl])

  // Sync playback rate without restarting
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

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

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value)
    setPlaybackRate(newSpeed)
    localStorage.setItem("practice-speed", newSpeed.toString())
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
      audioRef.current.playbackRate = playbackRate
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
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl flex flex-col gap-6 transition-all duration-500">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center px-2">
        <h2 className="text-slate-400 text-[10px] tracking-[0.2em] uppercase font-bold">Active Segment</h2>
        <div className="text-[10px] text-slate-500 font-mono tracking-wider bg-slate-800/40 px-2 py-1 rounded-md border border-slate-700/30">
          <span className="text-teal-400">{formatTime(currentTime)}</span> <span className="opacity-30">/</span> {formatTime(duration)}
        </div>
      </div>

      {/* Progress & Waveform Scrubber */}
      <div className="relative w-full group px-2">
        <div 
          className="relative w-full h-12 flex items-center cursor-pointer"
          onClick={handleSeek}
        >
          {/* Decorative Waveform Mockup */}
          {isMounted && (
            <div className="absolute inset-x-0 h-8 flex items-end justify-between opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-500">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className={clsx(
                    "w-[2px] rounded-full bg-teal-400 transition-all duration-300",
                    (i / 40) * 100 < progress ? "bg-teal-400 opacity-100" : "bg-slate-500 opacity-50"
                  )} 
                  style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.8) * 20 + 25}%` }}
                />
              ))}
            </div>
          )}

          {/* Scrubber Line */}
          <div className="w-full h-[6px] bg-slate-800 rounded-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_15px_rgba(45,212,191,0.5)] transition-all duration-150 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Knob (Optional visual touch) */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-teal-500 scale-0 group-hover:scale-100 transition-transform duration-200 pointer-events-none"
            style={{ left: `calc(${progress}% - 8px)` }}
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

      {/* Main Control Dashboard */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-2 justify-center sm:justify-between px-1">
        
        {/* Playback Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={replay}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/40 hover:border-teal-500/30 transition-all active:scale-90 focus:outline-none"
            title="Replay (Ctrl+Space)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className={clsx(
              "relative flex items-center justify-center py-3 px-5 sm:px-6 rounded-full transition-all duration-300 shadow-lg active:scale-95 group focus:outline-none min-w-[100px] sm:min-w-[120px]",
              isPlaying 
                ? "bg-slate-800 text-slate-300 border border-slate-700/60" 
                : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-teal-500/20"
            )}
          >
            {!isPlaying && (
              <div className="absolute inset-0 rounded-full bg-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}
            <span className="relative text-[10px] sm:text-xs tracking-[0.2em] uppercase">
              {isPlaying ? "Pause" : "Listen"}
            </span>
          </button>
        </div>

        {/* Global Settings Block */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Speed Selector (The Clock) */}
          <div className="flex items-center gap-1.5 bg-slate-800/40 px-3 py-2.5 rounded-full border border-slate-700/50 hover:border-slate-600 transition-colors shrink-0">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <select
              value={playbackRate}
              onChange={handleSpeedChange}
              className="bg-transparent text-slate-200 text-xs font-mono outline-none cursor-pointer focus:text-teal-400 transition-colors"
            >
              {speeds.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">
                  {s === 1.0 ? "1" : `${s}x`}
                </option>
              ))}
            </select>
          </div>
 
          {/* Volume Minimalist Slider */}
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-2.5 rounded-full border border-slate-700/50 w-[110px] sm:w-[130px] shrink-0">
            <div className="text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 transition-all min-w-0"
            />
            <span className="text-[9px] font-mono text-slate-500 min-w-[1.5rem] text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Elegant Footer Shortcuts */}
      <div className="pt-2 border-t border-slate-800/50">
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.15em] text-center">
          <span className="text-slate-400/50">CTRL+SPACE</span> REPLAY • 
          <span className="text-slate-400/50 ml-3">↑/↓</span> VOLUME • 
          <span className="text-slate-400/50 ml-3">[ / ]</span> SPEED
        </p>
      </div>
    </div>
  )
}
