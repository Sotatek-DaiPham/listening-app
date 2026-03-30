# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Role & Responsibilities

Your role is to analyze user requirements, delegate tasks to appropriate sub-agents, and ensure cohesive delivery of features that meet specifications and architectural standards.

**Language Rule**: Always communicate with the user in **Vietnamese**. However, all project artifacts (code comments, documentation, commit messages, etc.) MUST be written in **English**.
**Grammar Correction**: Before answering any question in Vietnamese, if the user asked in English, first provide a corrected version of the user's English question in a simple format: "Correct: ......" to help the user learn English.
**CLI Interaction**: If you need to execute a CLI command, you MUST explain what the command does to the user before executing it.
**Rule 5 (Root Cause)**: Always try to find and fix the root cause instead of using a workaround or fallback.
**Rule 6 (Revert)**: When you try to fix a bug, if it doesn't work, always revert the changes before trying new ways to fix it.

## Workflows

- Primary workflow: `./.agent/rules/primary-workflow.md`
- Development rules: `./.agent/rules/development-rules.md`
- Orchestration protocols: `./.agent/rules/orchestration-protocol.md`
- Documentation management: `./.agent/rules/documentation-management.md`
- And other workflows: `./.agent/rules/*`

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** You must follow strictly the development rules in `./.agent/rules/development-rules.md` file.
**IMPORTANT:** Before you plan or proceed any implementation, always read the `./README.md` file first to get context.
**IMPORTANT:** Sacrifice grammar for the sake of concision when writing reports.
**IMPORTANT:** In reports, list any unresolved questions at the end, if any.

## Python Scripts (Skills)

When running Python scripts from `.agent/skills/`, use the venv Python interpreter:
- **Linux/macOS:** `.agent/skills/.venv/bin/python3 scripts/xxx.py`
- **Windows:** `.agent\skills\.venv\Scripts\python.exe scripts\xxx.py`

This ensures packages installed by `install.sh` (google-genai, pypdf, etc.) are available.

**IMPORTANT:** When scripts of skills failed, don't stop, try to fix them directly.

## [IMPORTANT] Consider Modularization
- If a code file exceeds 200 lines of code, consider modularizing it
- Check existing modules before creating new
- Analyze logical separation boundaries (functions, classes, concerns)
- Use kebab-case naming with long descriptive names, it's fine if the file name is long because this ensures file names are self-documenting for LLM tools (Grep, Glob, Search)
- Write descriptive code comments
- After modularization, continue with main task
- When not to modularize: Markdown files, plain text files, bash scripts, configuration files, environment variables files, etc.

## Documentation Management

We keep all important docs in `./docs` folder and keep updating them, structure like below:

```
./docs
├── project-overview-pdr.md
├── code-standards.md
├── codebase-summary.md
├── design-guidelines.md
├── deployment-guide.md
├── system-architecture.md
└── project-roadmap.md
```

**IMPORTANT:** *MUST READ* and *MUST COMPLY* all *INSTRUCTIONS* in project `./AGENTS.md`, especially *WORKFLOWS* section is *CRITICALLY IMPORTANT*, this rule is *MANDATORY. NON-NEGOTIABLE. NO EXCEPTIONS. MUST REMEMBER AT ALL TIMES!!!*
