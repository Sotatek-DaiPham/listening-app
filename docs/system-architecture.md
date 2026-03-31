# System Architecture

## Overview
Linguist Dictation Master follows a full-stack Next.js architecture leveraging API routes for backend logic and the App Router for frontend rendering.

## Core Components
1. **Frontend (Next.js & React)**
   - Responsible for the user interface, including the text input arena for dictation and library dashboards.
   - Built with TailwindCSS for styling.

2. **Backend (Next.js API Routes)**
   - Handles RESTful requests from the client.
   - Delegates media processing to FFmpeg.
   - Manages authentication via Auth.js (OAuth2).

3. **Data Layer (PostgreSQL)**
   - Stores user profiles, media metadata, transcription progress, and segment bookmarks.
   
4. **Storage Layer**
   - Local filesystem storage for audio files (MP3/WAV) uploaded by admins or users.
   - FFmpeg Manual Resolver: A custom path resolution strategy in `src/lib/media/ffmpeg.ts` handles binary detection specifically for Windows/Turbopack compatibility.

## Key Logic
- **Normalization**: Text-matching logic strips punctuation and whitespace to ensure phonetic accuracy over strict typing.
- **Mastery Tracking**: `UserProgress` table tracks `segmentId` completion status and bookmark status, which is visualized as an emerald "MASTERED" badge in the UI.
- **Bookmark Persistence**: The `Bookmark` model handles point-to-point relations between `User`, `Media`, and `Segment` for favorites management.
