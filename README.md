# Linguist Dictation Master

Linguist Dictation Master is a structured language practice web application that helps users transition from passive to active listening through audio and SRT-based transcription (dictation).

## Features
- **Media Processing Engine**: Upload MP3/WAV and SRT files. Uses FFmpeg to automatically slice original audio.
- **Practice Arena**: Play individual audio segments and type transcriptions. Includes an intelligent text matching engine.
- **Media Library**: System Library for admins, and Bring-Your-Own-Media for users.

## Tech Stack
- Frontend/API: Next.js (App Router), TailwindCSS
- DB: PostgreSQL
- Media: fluent-ffmpeg

## Development

```bash
npm run dev
# or yarn dev, pnpm dev, bun dev
```
