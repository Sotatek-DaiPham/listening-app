# Code Standards & Guidelines

## General Principles
- **Concise & Modular**: Keep files under 200 lines where possible. Consider modularization if a code block grows.
- **Naming Conventions**: Use kebab-case for filenames with descriptive names. This makes them self-documenting for tools (Grep, Glob, Search).
- **Comments**: Write descriptive code comments explaining the "why", not just the "what".

## Architecture
- Use Next.js App Router conventions (`page.tsx`, `layout.tsx`, `route.ts`).
- Segregate concerns: UI components, API routes, data models, and utility libraries should be logically separated.

## Development Workflow
- Follow the agentic workflows defined in `.agent/workflows`.
- Use the `.agent/rules/development-rules.md` for specific AI coding agent constraints.
