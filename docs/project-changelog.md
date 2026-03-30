# Project Changelog

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
