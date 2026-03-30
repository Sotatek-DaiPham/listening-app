import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'

// Manual path resolution to bypass Turbopack/Next.js bundling issues with @ffmpeg-installer
function getFfmpegPath() {
  const isWin = process.platform === 'win32';
  const binName = isWin ? 'ffmpeg.exe' : 'ffmpeg';
  
  // Try to find it manually in common node_modules patterns
  const pathsToTry = [
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', `win32-x64`, binName),
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', `linux-x64`, binName),
    path.join(process.cwd(), 'node_modules', '@ffmpeg-installer', `darwin-x64`, binName),
  ];

  for (const p of pathsToTry) {
    if (fs.existsSync(p)) return p;
  }

  // Fallback to the installer's own resolution if manual fails (might still fail in build)
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    return ffmpegInstaller.path;
  } catch (e) {
    console.error('Failed to resolve ffmpeg path automatically', e);
    return 'ffmpeg'; // Hope it's in the system PATH
  }
}

ffmpeg.setFfmpegPath(getFfmpegPath())

export interface FfmpegSliceOptions {
  inputPath: string
  outputPath: string
  startTimeMs: number
  durationMs: number
}

/**
 * Validates that FFmpeg is installed and accessible
 */
export async function validateFfmpeg(): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg.getAvailableFormats((err) => {
      if (err) resolve(false)
      else resolve(true)
    })
  })
}

/**
 * Extracts a specific segment from an audio file using FFmpeg
 */
export async function sliceAudioSegment({
  inputPath,
  outputPath,
  startTimeMs,
  durationMs
}: FfmpegSliceOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists before slicing
    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    ffmpeg(inputPath)
      .setStartTime(startTimeMs / 1000)
      .setDuration(durationMs / 1000)
      .output(outputPath)
      .on('end', () => {
        resolve(outputPath)
      })
      .on('error', (err) => {
        console.error('FFmpeg slice error:', err)
        reject(err)
      })
      .run()
  })
}
