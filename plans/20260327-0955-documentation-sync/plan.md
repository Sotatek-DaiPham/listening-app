# Plan: Documentation Synchronization (2026/03/27)

Following the formal workspace rules, we need to sync the `./docs` directory with the current state of the application, as the existing docs are outdated (still in Phase 1).

## Current Implementations (Not in Docs)
- **Auth**: Next.js Auth.js (v5) with GitHub/Google providers.
- **DB**: Prisma + PostgreSQL (User, Account, Media, Segment, UserProgress).
- **Storage**: Local filesystem storage in `public/uploads`.
- **Media Engine**: FFmpeg-based slicing in `src/lib/media/`.
- **UI**: High-fidelity Practice Arena with side-by-side layout and mastered status.
- **Library**: User upload and management dashboard.

## Proposed Changes

### 1. Update `docs/project-roadmap.md`
- Mark Phases 2, 3, 4, and 5 as [x] Complete.
- Add Phase 6: Refinement & Advanced Features (AI Grammar, Mobile Sync).

### 2. Update `docs/codebase-summary.md`
- Reflect the current App Router structure (`src/app/`, `src/components/`, `src/lib/`).
- Update Tech Stack (Auth.js v5, Prisma, fluent-ffmpeg).

### 3. Create `docs/project-changelog.md` [NEW]
- Document the major feature sets implemented so far.

### 4. Update `docs/system-architecture.md`
- Describe the data flow: Upload -> Storage -> DB -> FFmpeg -> Practice.

## Implementation Steps
1. Update Roadmap.
2. Update Codebase Summary.
3. Create Changelog.
4. Update Architecture.

## Success Criteria
- All standard project docs accurately reflect the current code state.
- Compliance with `documentation-management.md`.
