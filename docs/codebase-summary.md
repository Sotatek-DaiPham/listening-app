# Codebase Summary

## Project Overview
Linguist Dictation Master is a full-stack Next.js application designed for active language listening and dictation. It features an automated audio slicing engine and a high-focus practice arena.

## Tech Stack Snapshot
- **Framework**: Next.js 15.x (App Router)
- **Authentication**: Auth.js v5 (GitHub, Google)
- **Database**: Prisma + PostgreSQL
- **Media Engine**: fluent-ffmpeg (with manual path resolution)
- **Styling**: TailwindCSS 4, React 19

## Directory Structure
- `src/app/`: Core routing and API handlers.
  - `/api/library`: Upload and media management.
  - `/api/practice`: Transcription and progress tracking.
  - `/practice/[id]`: The specialized dictation arena.
  - `/library`: User media dashboard.
- `src/components/`: Modular UI: `practice/`, `auth/`, etc.
- `src/lib/`: Backend utilities: `storage/`, `media/`, `prisma.ts`, `auth.ts`.
- `public/uploads/`: Local storage for processed audio segments.
- `docs/`: Formal project documentation.
- `plans/`: Implementation plans and research reports.

## State of the Code
The core feature set (Phase 1-5) is complete and production-ready. The application supports user authentication, media upload, automated slicing, and a tracked dictation workflow. Next milestones involve AI-driven educational enhancements.
