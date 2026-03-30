# Project Changelog

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
