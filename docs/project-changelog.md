# Project Changelog

## [0.4.0] - 2026-03-31
### Added
- **Sentence Bookmarking**: Users can now favorite specific segments with a heart icon.
- **UI Differentiation**: Replaced the duplicate heart icon with a Bookmark Ribbon for the favorites list and a Heart for individual toggles.
- **Layout Optimization**: Grouped the bookmark toggle with the MASTERED badge for better context.
- **Favorites Sidebar**: A dedicated sidebar within the practice arena to view and jump to bookmarked sentences.
- **Bookmark Persistence**: Bookmarks are saved to the database and synced across sessions.
- **Optimistic UI**: Snappy UI updates when toggling bookmarks.

## [0.3.0] - 2026-03-31

### Added
- **Audio Volume Control**: Integrated a high-precision volume slider in the `DictationPlayer` for fine-grained audio adjustment.
- **Volume Persistence**: Implemented `localStorage` syncing to remember user volume preferences across sessions and segments.
- **Audio Keyboard Shortcuts**: Added `ArrowUp` and `ArrowDown` shortcuts for quick 10% volume increments/decrements.
- **Dynamic Volume Icons**: Adaptive UI icons that reflect the current audio state (muted, low, or high volume).
- **Shortcuts Legend**: Added a non-intrusive tooltip in the practice arena to guide users on keyboard productivity.

## [0.2.0] - 2026-03-30


### Added
- **AI Grammar Analysis**: Integrated Gemini AI to provide natural Vietnamese translations and concise grammar insights for each segment.
- **Dynamic Original Sentence Reveal**: Automatically displays the correct text after a successful match to reinforce learning.
- **Keyboard Shortcuts**: Added (Enter) shortcut to quickly skip to the next segment after mastery.
- **Markdown Rendering**: Integrated `react-markdown` for styled, readable AI explanations with teal-colored highlights.
- **Smart Text Normalization**: Enhanced text-matching engine to handle smart quotes (`“”`, `‘’`) and diverse punctuation (em-dash, etc.).
- **AI Response Caching**: Implemented database persistence for AI analysis to optimize performance and reduce API costs.

### Fixed
- **Prisma Client Sync**: Resolved Windows file-lock issues (`EPERM`) by automating node process termination during schema updates.
- **Input Accuracy**: Improved normalization logic in `DictationInput` to filter out non-alphanumeric noise and handle smart punctuation.

## [0.1.0] - 2026-03-27

### Added
- **Authentication System**: Integrated Auth.js v5 with GitHub and Google OAuth providers.
- **In-App Auth Modals**: Replaced default NextAuth pages with branded, sleek login/logout modals.
- **Media Processing Engine**: Automated FFmpeg slicing of MP3/SRT files into bite-sized dictation segments.
- **Specialized Practice Arena**: High-focus Side-by-Side UI for audio playback and transcription input.
- **Text-Matching Logic**: Intelligent normalization for transcription verification (case-insensitive, punctuation-stripped).
- **User Library**: BYOM (Bring-Your-Own-Media) upload system with local storage integration.
- **Progress Tracking**: Real-time "Mastered" status for completed segments.
- **Windows Reliability**: Manual FFmpeg path resolution to bypass Turbopack/Next.js bundling limitations.

### Fixed
- **UI Overflow**: Compact header and adjusted margins to ensure a scroll-free practice experience.
- **FFmpeg Resolution**: Resolved `Module not found` error during Turbopack dev-server start.

### Documentation
- Formalized project docs in `docs/` and established the `plans/` directory for tracked development.
