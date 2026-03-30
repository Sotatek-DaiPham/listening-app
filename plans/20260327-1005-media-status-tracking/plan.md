# Plan: Media Processing Status & Progress (2026/03/27)

## Problem
Currently, media processing happens in the background without UI feedback. Users can access the practice page before segments are fully sliced, leading to a broken experience.

## Proposed Changes

### 1. Database Schema
Update `Media` model in `prisma/schema.prisma`:
- `status`: String (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) - default `PENDING`
- `totalSegments`: Int - default 0
- `processedSegments`: Int - default 0
- `errorMessage`: String?

### 2. Backend Processor (`src/lib/media/processor.ts`)
- Update `Media` status to `PROCESSING` at the start.
- Set `totalSegments` after parsing SRT.
- Increment `processedSegments` and update timestamp after each successful FFmpeg slice.
- Set status to `COMPLETED` at the end or `FAILED` on error.

### 3. Library UI (`src/app/library/page.tsx`)
- Display a progress bar or status badge for each media item.
- Disable the "Practice" button for items not in `COMPLETED` status.
- Add a refresh mechanism or simple polling if an item is `PROCESSING`.

### 4. Practice Page Protection (`src/app/practice/[mediaId]/page.tsx`)
- Redirect to library with a toast message if a user tries to access a non-completed media item.

## Implementation Steps
1. Update Prisma schema and migrate (`npx prisma db push`).
2. Update `processor.ts` to track progress.
3. Update `upload/route.ts` to initialize fields.
4. Update Library UI to show progress bars.
5. Update Practice Page protection logic.

## Success Criteria
- Uploading a new file shows "Processing (X/Y)" in the library.
- "Practice" button only works when 100% complete.
- Error handling works if FFmpeg fails.
