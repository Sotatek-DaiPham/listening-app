import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

export interface YouTubeMediaInfo {
  title: string;
  thumbnail: string;
  audioPath: string;
  srtContent: string;
}

/**
 * Converts YouTube Transcript JSON to SRT format
 * (Keep this as fallback, but yt-dlp can get SRT directly)
 */
function convertToSrt(transcript: any[]): string {
  return transcript
    .map((item, index) => {
      const start = formatTimestamp(item.offset);
      const end = formatTimestamp(item.offset + item.duration);
      return `${index + 1}\n${start} --> ${end}\n${item.text}\n`;
    })
    .join("\n");
}

function formatTimestamp(ms: number): string {
  const date = new Date(0);
  date.setMilliseconds(ms);
  const hours = Math.floor(ms / 3600000).toString().padStart(2, "0");
  const full = date.toISOString().substr(11, 12).replace(".", ",");
  return hours + full.substr(2);
}

/**
 * Downloads audio and transcript from a YouTube URL using local yt-dlp binary
 */
export async function downloadYouTubeMedia(url: string): Promise<YouTubeMediaInfo> {
  const ytDlpPath = path.join(process.cwd(), "yt-dlp.exe");
  const tempDir = path.join(process.cwd(), "public", "uploads", "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const audioFilename = `yt_${timestamp}.mp3`;
  const audioPath = path.join(tempDir, audioFilename);
  const subtitlePrefix = path.join(tempDir, `yt_${timestamp}`);

  try {
    console.log(`[YouTube] Fetching metadata and downloading with yt-dlp: ${url}`);
    
    // 1. Get info (Title, Thumbnail)
    const infoJson = execSync(`"${ytDlpPath}" --dump-json "${url}"`, { encoding: "utf8" });
    const info = JSON.parse(infoJson);
    const title = info.title;
    const thumbnail = info.thumbnail;

    // 2. Download Audio and Subtitles simultaneously
    // --write-sub: get manual subtitles
    // --write-auto-subs: get auto-generated as fallback
    // --sub-format srt: output srt
    // --extract-audio --audio-format mp3: convert to mp3
    console.log(`[YouTube] Downloading audio and subtitles (prioritizing manual)...`);
    
    // We use spawn to handle the potential long wait and output
    const cmdArgs = [
      url,
      "--extract-audio",
      "--audio-format", "mp3",
      "--write-sub",           // Added: get manual subs
      "--write-auto-sub",      // Fallback
      "--sub-lang", "en", // Specific English only to avoid 429
      "--sub-format", "srt",
      "--output", `${tempDir}/yt_${timestamp}.%(ext)s`,
      "--no-playlist"
    ];

    await new Promise((resolve, reject) => {
      const child = spawn(ytDlpPath, cmdArgs);
      let stderr = "";

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`yt-dlp exited with code ${code}\nStderr: ${stderr}`));
      });
      child.on("error", reject);
    });

    // 3. Find and read the SRT file with priority
    // Manual files usually look like: yt_123.en.srt
    // Auto files usually look like: yt_123.en.auto-generated.srt
    let srtContent = "";
    const files = fs.readdirSync(tempDir);
    const srtFiles = files.filter(f => f.startsWith(`yt_${timestamp}`) && f.endsWith(".srt"));
    
    if (srtFiles.length > 0) {
      // Priority Logic: 
      // 1. Files WITHOUT "auto-generated" in the name
      // 2. The shortest filename (usually implies more direct match)
      const manualSrtFile = srtFiles.find(f => !f.toLowerCase().includes("auto-generated"));
      const chosenFile = manualSrtFile || srtFiles[0];

      const srtPath = path.join(tempDir, chosenFile);
      srtContent = fs.readFileSync(srtPath, "utf8");
      console.log(`[YouTube] ${manualSrtFile ? 'MANUAL' : 'AUTO'} subtitles chosen: ${chosenFile}`);
      
      // Clean up all subtitle files discovered for this run
      for (const f of srtFiles) {
        try {
          fs.unlinkSync(path.join(tempDir, f));
        } catch (e) {}
      }
    } else {
      console.warn(`[YouTube] No subtitle file found.`);
    }

    return {
      title,
      thumbnail,
      audioPath,
      srtContent,
    };
  } catch (error) {
    console.error(`[YouTube] Extraction failed with yt-dlp:`, error);
    throw error;
  }
}
