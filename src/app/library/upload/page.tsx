"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"

export default function UploadPage() {
  const [fileAudio, setFileAudio] = useState<File | null>(null)
  const [fileSrt, setFileSrt] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleUpload = async (e: React.FormEvent) => {
    // ... same start
    e.preventDefault()
    if (!fileAudio || !fileSrt || !title.trim()) {
      setMessage("Please fill all fields.")
      return
    }

    setIsUploading(true)
    setMessage("Uploading files...")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("audio", fileAudio)
    formData.append("srt", fileSrt)
    formData.append("title", title)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setUploadProgress(percent)
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setIsUploading(false)
        setShowSuccess(true)
        setUploadProgress(100)
        setTimeout(() => router.push("/library"), 3000)
      } else {
        const errorData = JSON.parse(xhr.responseText || '{"error": "Unknown error"}')
        setMessage(`Error: ${errorData.error}`)
        setIsUploading(false)
      }
    })

    xhr.addEventListener("error", () => {
      setMessage("Network error occurred during upload.")
      setIsUploading(false)
    })

    xhr.open("POST", "/api/library/upload")
    xhr.send(formData)
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-slate-800 p-10 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white">Upload Successful!</h1>
          <p className="text-slate-400 leading-relaxed">
            Your files are now being processed by our AI engine. We're slicing the audio and aligning transcripts.
          </p>
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-center gap-3 text-teal-400 font-medium">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing & Slicing...</span>
            </div>
            <p className="text-xs text-slate-500">Redirecting to your library in a few seconds...</p>
          </div>
          <button 
            onClick={() => router.push("/library")}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
            Go to Library Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-4">
        <Link 
          href="/library"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors font-medium text-sm group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Library
        </Link>
      </div>

      <form onSubmit={handleUpload} className="w-full max-w-lg bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500 mb-2">
            Upload Custom Media
          </h1>
          <p className="text-slate-400 text-sm">Bring your own MP3 and SRT files to the Practice Arena.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="e.g. TED Talk - Bill Gates"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1">Audio File (.mp3)</label>
            <input 
              type="file" 
              accept=".mp3,audio/mpeg"
              onChange={e => setFileAudio(e.target.files?.[0] || null)}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1">Subtitle File (.srt)</label>
            <input 
              type="file" 
              accept=".srt"
              onChange={e => setFileSrt(e.target.files?.[0] || null)}
              className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20"
              required
            />
          </div>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-teal-400 font-bold uppercase tracking-wider">
              <span>Uploading to server</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div 
                className="bg-teal-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {message && !isUploading && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.includes('Error') || message.includes('failed') || message.includes('Network') ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isUploading}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]"
        >
          {isUploading ? "Uploading..." : "Upload & Process"}
        </button>
      </form>
    </div>
  )
}
