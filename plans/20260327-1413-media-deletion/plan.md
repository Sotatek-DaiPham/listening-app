# Plan: Media Deletion (2026/03/27)

## Problem
Users cannot delete existing exercises. Deleting an exercise must clean up:
1.  **Database**: `Media`, `Segment`, and `UserProgress` records.
2.  **Storage**: The source audio file, the SRT file, and all chunked audio snippets.

## Proposed Changes

### 1. API Route (`src/app/api/library/[mediaId]/route.ts`) [NEW]
- Implement a `DELETE` handler.
- Verify ownership (user must own the media).
- Fetch all `Segment` audio URLs.
- Delete all files from storage (source, SRT, and all segments).
- Delete the `Media` record (cascade will handle segments and progress).

### 2. Library UI (`src/app/library/page.tsx`)
- Add a "Delete" button to the media card.
- Show a confirmation dialog before proceeding.
- Handle the deletion state (optimistic update or simple reload).

## Implementation Steps
1. Create the `DELETE` API route.
2. Update the `LibraryPage` to include a delete button.
3. Test locally to ensure files are removed from `public/uploads`.

## Success Criteria
- Clicking Delete removes the card from the UI.
- All associated files are removed from the filesystem.
- Database records are completely wiped for that media ID.
