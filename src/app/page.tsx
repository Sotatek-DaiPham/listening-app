import Link from "next/link"
import { auth } from "@/lib/auth"
import { StartPracticingButton } from "@/components/auth/auth-buttons"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
          Linguist <span className="text-teal-400">Dictation</span>
        </div>
        {session?.user ? (
          <Link 
            href="/library" 
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            My Library
          </Link>
        ) : (
          <div className="text-sm font-semibold text-slate-300">
            Welcome
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
          Early Access v0.1.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-teal-500 tracking-tight mb-8">
          Master Any Language <br className="hidden md:block" /> Through Deep Listening
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-2xl">
          Bring your own audio and subtitle files. Our engine automatically slices them into bite-sized segments for focused, loop-based dictation training. Stop casually hearing, start actively listening.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {session?.user ? (
            <Link 
              href="/library"
              className="px-8 py-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-lg font-bold rounded-2xl transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 group"
            >
              Resume Practice
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          ) : (
            <StartPracticingButton />
          )}
          
          <a
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-lg font-bold rounded-2xl transition-all border border-slate-700 shadow-md flex items-center justify-center gap-2"
          >
            View GitHub
          </a>
        </div>
        
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
          <div className="p-8 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm text-center">
            <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-6 mx-auto shadow-inner shadow-teal-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <h3 className="text-slate-200 text-lg font-bold mb-3">BYOM Supported</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Upload any MP3 & SRT pair. We handle the heavy lifting of slicing audio perfectly.</p>
          </div>
          
          <div className="p-8 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm text-center">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 mx-auto shadow-inner shadow-emerald-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-slate-200 text-lg font-bold mb-3">Real-time Check</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Get instant visual feedback on every single keystroke against the exact source transcripts.</p>
          </div>
          
          <div className="p-8 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm text-center">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 mx-auto shadow-inner shadow-blue-500/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="text-slate-200 text-lg font-bold mb-3">Track Progress</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Monitor your completed segments to ensure 100% phonetic mastery over time.</p>
          </div>
        </div>
      </main>
      
      <footer className="text-center py-8 text-slate-500 text-sm border-t border-slate-800">
        &copy; {new Date().getFullYear()} Linguist Dictation Master.
      </footer>
    </div>
  )
}
