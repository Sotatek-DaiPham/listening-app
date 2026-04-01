import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import fs from 'fs'

// Helper to check if a command exists in system PATH
function isCommandInPath(command: string) {
  try {
    const { execSync } = require('child_process');
    execSync(`${command} -version`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Manual path resolution to bypass Turbopack/Next.js bundling issues with @ffmpeg-installer
function getFfmpegPath() {
  // Prioritize system path for robustness on Windows
  if (isCommandInPath('ffmpeg')) return 'ffmpeg';

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

  return 'ffmpeg'; 
}

function getFfprobePath() {
  if (isCommandInPath('ffprobe')) return 'ffprobe';

  const isWin = process.platform === 'win32';
  const binName = isWin ? 'ffprobe.exe' : 'ffprobe';
  
  // Check the same node_modules path as ffmpeg
  const ffmpegPath = getFfmpegPath();
  if (ffmpegPath !== 'ffmpeg') {
    const ffprobePath = path.join(path.dirname(ffmpegPath), binName);
    if (fs.existsSync(ffprobePath)) return ffprobePath;
  }

  return 'ffprobe';
}

ffmpeg.setFfmpegPath(getFfmpegPath())
ffmpeg.setFfprobePath(getFfprobePath())

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
