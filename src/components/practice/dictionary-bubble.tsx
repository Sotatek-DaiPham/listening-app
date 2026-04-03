"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { clsx } from "clsx"

interface DictionaryBubbleProps {
  word: string
  context: string
  mediaTitle?: string
  position: { top: number; left: number }
  onClose: () => void
}

export function DictionaryBubble({ 
  word, 
  context, 
  mediaTitle, 
  position, 
  onClose 
}: DictionaryBubbleProps) {
  const [definition, setDefinition] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const fetchDefinition = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/practice/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, context, mediaTitle })
      })
      const data = await res.json()
      if (data.definition) {
        setDefinition(data.definition)
      } else {
        setError("Không tìm thấy định nghĩa.")
      }
    } catch (e) {
      setError("Lỗi kết nối AI.")
    } finally {
      setIsLoading(false)
    }
  }

  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  // Pre-fetch if needed? For now, we wait for the first render
  // and show the "Search" button inside the bubble to be safe.
  
  return (
    <div 
      ref={bubbleRef}
      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: 'translate(-50%, -100%) translateY(-10px)' 
      }}
    >
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-4 w-72 sm:w-80 group relative">
        {/* Triangle Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900/90 rotate-45 border-r border-b border-slate-700/50" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <h3 className="text-teal-400 font-black text-lg truncate max-w-[180px]" title={word}>
              {word}
            </h3>
            <button 
              onClick={speak}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors active:scale-95 shrink-0"
              title="Speak"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!definition && !isLoading && !error ? (
          <button 
            onClick={fetchDefinition}
            className="w-full py-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-teal-500/20 transition-all active:scale-95"
          >
            🔍 TRA NGHĨA BẰNG AI
          </button>
        ) : (
          <div className="min-h-[60px] flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-teal-500 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase animate-pulse">Đang tra cứu...</span>
              </div>
            ) : error ? (
              <p className="text-rose-400 text-xs text-center italic">{error}</p>
            ) : (
              <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-xs max-w-none overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 mb-2">{children}</ul>,
                    li: ({ children }) => <li className="marker:text-teal-500/50">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="text-teal-400 font-black tracking-tight drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {definition || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
