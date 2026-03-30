"use client"

import { useState, useEffect } from "react"
import { clsx } from "clsx"

interface DictationInputProps {
  segmentId: string
  correctText: string
  onSuccess: () => void
  onStateChange?: (isMastered: boolean) => void
}

const normalizeText = (text: string) => {
  return text.toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"–—“”]/g, " ") // Đã thêm “” 
    .replace(/[‘’]/g, "'") // Chuẩn hóa dấu nháy thông minh thành dấu nháy đơn
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0 && /[a-z0-9]/.test(word))
}

export function DictationInput({ segmentId, correctText, onSuccess, onStateChange }: DictationInputProps) {
  const [inputVal, setInputVal] = useState("")
  const [hasSucceeded, setHasSucceeded] = useState(false)
  const [translation, setTranslation] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const targetWords = normalizeText(correctText)
  console.log("targetWords", targetWords)
  const inputWords = normalizeText(inputVal)
  console.log("inputWords", inputWords)

  // Reset local state when segment changes
  useEffect(() => {
    setInputVal("")
    setHasSucceeded(false)
    setTranslation(null)
    setIsTranslating(false)
  }, [segmentId])

  // Auto-verify when they finish typing the whole thing
  useEffect(() => {
    if (hasSucceeded) return

    // Quick crude match
    const isFullMatch = targetWords.join(" ") === inputWords.join(" ")
    if (isFullMatch && inputWords.length === targetWords.length && inputWords[0] !== "") {
      setHasSucceeded(true)
    }
  }, [inputVal, targetWords, inputWords, hasSucceeded])

  useEffect(() => {
    onStateChange?.(hasSucceeded)
  }, [hasSucceeded, onStateChange])

  const handleNext = () => {
    onSuccess()
  }

  const requestHint = () => {
    if (hasSucceeded) return
    for (let i = 0; i < targetWords.length; i++) {
      if (inputWords[i] !== targetWords[i]) {
        // Auto-complete the prefix accurately up to the stuck word
        const correctPrefix = targetWords.slice(0, i + 1).join(" ")
        setInputVal(correctPrefix + " ")
        break
      }
    }
  }

  const handleTranslate = async () => {
    if (translation || isTranslating) return

    setIsTranslating(true)
    try {
      const res = await fetch(`/api/practice/segments/${segmentId}/translate`, {
        method: 'POST'
      })
      const data = await res.json()
      if (data.translation) {
        setTranslation(data.translation)
      }
    } catch (e) {
      console.error("Translation failed", e)
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center z-20 h-full">
      <div className="w-full p-1 bg-gradient-to-r from-teal-500/30 to-blue-500/30 rounded-2xl mb-2 flex-grow">
        <textarea
          autoFocus
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={hasSucceeded}
          placeholder="Type what you hear..."
          className={clsx(
            "w-full h-32 md:h-48 p-6 bg-slate-900 rounded-xl text-slate-100 text-lg md:text-xl font-medium resize-none focus:outline-none transition-colors",
            hasSucceeded ? "border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "focus:bg-slate-800/80"
          )}
        />
      </div>
      {/* AI Actions Row */}
      <div className="w-full flex justify-end items-center gap-3 px-2 mt-2 mb-6">
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={clsx(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 py-2 rounded-xl border backdrop-blur-sm",
            translation
              ? "text-teal-400 bg-teal-400/5 border-teal-400/20 shadow-[0_0_15px_rgba(20,184,166,0.05)]"
              : (isTranslating
                ? "text-slate-500 bg-slate-800/80 border-slate-700/50 cursor-wait"
                : "text-blue-400/80 hover:text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/20 active:scale-95")
          )}
        >
          {isTranslating ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          )}
          {translation ? "Translated" : (isTranslating ? "Translating..." : "Translate")}
        </button>

        {!hasSucceeded && (
          <button
            onClick={requestHint}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-500/80 hover:text-amber-400 border border-amber-500/20 hover:border-amber-400/40 rounded-xl backdrop-blur-md active:scale-95"
            title="Reveal Next Word"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Hint
          </button>
        )}
      </div>

      {translation && (
        <div className="w-full mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Vietnamese Translation
            </div>
            <p className="text-slate-300 text-sm italic leading-relaxed">"{translation}"</p>
          </div>
        </div>
      )}



      {/* Visual Feedback for Typed Words (Educational focus) */}
      {!hasSucceeded && inputVal.length > 0 && (
        <div className="w-full mt-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-wrap gap-2 text-lg">
          {targetWords.map((targetWord, index) => {
            const inputWord = inputWords[index]

            if (!inputWord) {
              return <span key={index} className="text-slate-600 blur-[2px] transition-all">{"_".repeat(targetWord.length)}</span>
            }

            const isCorrect = inputWord === targetWord
            const isTypingCurrently = index === inputWords.length - 1 && inputVal.endsWith(' ') === false

            return (
              <span
                key={index}
                className={clsx(
                  "px-1 py-0.5 rounded transition-all duration-300",
                  isCorrect ? "text-emerald-400" : (isTypingCurrently ? "text-slate-300" : "text-rose-400 line-through decoration-rose-400/50 bg-rose-500/10")
                )}
              >
                {inputWord}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
