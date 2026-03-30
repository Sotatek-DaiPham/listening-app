# Plan: Fix Stuck Processing & Add Upload Progress (2026/03/27)

## Problem
1. **No Upload Progress**: The user doesn't know the status of the initial file transfer.
2. **Stuck Processing**: Media items are bypassing the server-side status check and appearing as "Processing Audio" indefinitely in the client, likely due to a failure in the background processor or stale Prisma client types.

## Proposed Changes

### 1. Upload Page (`src/app/library/upload/page.tsx`)
- Replace `fetch` with `XMLHttpRequest` to track upload progress.
- Display a real-time progress bar for the file transfer phase.

### 2. Practice Page (`src/app/practice/[mediaId]/page.tsx`)
- Beef up the protection. If any of the new fields (`status`, `totalSegments`) are missing, assume it's an old record or error state.
- Ensure the server-side check is robust even if types are stale.

### 3. Practice Client (`src/components/practice/practice-client.tsx`)
- Remove the redundant `segments.length === 0` fallback. Let the parent page handle it.
- If it reaches the client with 0 segments AND status is COMPLETED, show an "Empty Content" error instead of "Processing".

### 4. Background Processor (`src/lib/media/processor.ts`)
- Add extensive logging.
- Ensure `status` is set to `FAILED` even on unexpected errors (e.g., FFmpeg binary missing).
- Fix the `prisma generate` issue by attempting a forceful regeneration or using raw queries if types remain broken.

### 5. API Route (`src/app/api/library/upload/route.ts`)
- Explicitly set `status: "PENDING"` during creation to ensure consistency.

## Implementation Steps
1. Update `processor.ts` with better logging and error resilience.
2. Update `UploadPage` with XHR progress tracking.
3. Update `PracticeClient` to remove redundant logic.
4. Verify DB state with a project-root script.
5. Attempt `prisma generate` again.
