"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function YoutubeImportCard() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/library/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import YouTube video");
      }

      // Success! Reset and refresh
      setUrl("");
      router.refresh();
      // Optionally show a success toast or message
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl mb-8">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        Import from YouTube
      </h2>
      
      <form onSubmit={handleImport} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube video link here..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-teal-500 transition-all disabled:opacity-50"
          />
          {error && (
            <p className="absolute -bottom-6 left-0 text-xs text-red-400">{error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !url}
          className="bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Fetching...
            </>
          ) : (
            "Import"
          )}
        </button>
      </form>
      <p className="text-[11px] text-slate-500 mt-4 italic">
        * We will automatically extract audio and subtitles for your dictation practice.
      </p>
    </div>
  );
}
