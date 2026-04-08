# Implementation Plan: Consolidar Projeto de Interface

**Branch**: `002-vue-only-docs` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-vue-only-docs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Remove all React/Next.js project files from the repository root and rewrite the project's documentation artifacts (`README.md`, `CLAUDE.md`, `.gitignore`) so that `vue/` is the single, unambiguous source for development contributions. No Vue component logic is changed; this is a consolidation and documentation-only task.

## Technical Context

**Language/Version**: TypeScript 5.x (Vue project); Markdown (documentation)
**Primary Dependencies**: None new — the Vue 3.5+ / Vite project in `vue/` is already fully configured
**Storage**: N/A (file system operations only — file deletion and document rewrites)
**Testing**: Manual verification — a new contributor follows only the updated docs and reaches a runnable `pnpm dev` environment without external help
**Target Platform**: GitHub repository (public development workflow)
**Project Type**: Repository consolidation / documentation update
**Performance Goals**: N/A
**Constraints**: No changes to Vue component logic; must preserve full git history; must not break any active feature branches; scope excludes any new Vue functionality
**Scale/Scope**: ~15 root-level files/directories removed; 3 documentation files rewritten (`README.md`, `CLAUDE.md`, `.gitignore`); `scripts/create-schema.js` removed; constitution amended

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | ✅ N/A | No component code changes in this feature |
| II. Vue 3 Idioms | ✅ N/A | No Vue SFC code changes |
| III. Accessibility | ✅ N/A | No component changes |
| IV. Slot-Based Extensibility | ✅ N/A | No component changes |
| V. Feature Parity | ✅ Pass | Vue project preserved fully intact; React removal is additive to Vue's status as the primary implementation |
| Technology Standards | ✅ Pass | Vue 3.5+/Vite/TypeScript stack preserved intact |
| Development Workflow — Coexistence | ⚠️ JUSTIFIED VIOLATION | "The existing React/Next.js code MUST remain untouched in its current location" — this rule was written as a temporary bridge during the Vue migration phase (feature 001). Feature 002 is the deliberate retirement of the React project. The constitution must be amended as part of this feature (see Complexity Tracking). |

**Post-Phase 1 re-check**: All five component principles remain N/A or passing. The constitution amendment is scoped and tracked.

## Project Structure

### Documentation (this feature)

```text
specs/002-vue-only-docs/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── readme-structure.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Root after consolidation — single Vue project
.gitignore             # ✏️ Updated: Vite patterns, Next.js entries removed
CLAUDE.md              # ✏️ Updated: correct paths (vue/src/) and pnpm commands
LICENSE                # ✅ Unchanged
README.md              # ✏️ Rewritten: Vue component library overview + API docs
specs/                 # ✅ Unchanged (feature planning docs)
vue/                   # ✅ Unchanged (Vue 3 project — the sole interface project)

# Removed (React/Next.js project and associated tooling):
# app/                 → Next.js app directory
# components/          → React tree-view + shadcn/ui React components
# lib/                 → React utilities and demo data
# public/              → Next.js favicon assets
# scripts/             → React schema generator (reads removed component)
# components.json      → shadcn/ui React config
# eslint.config.mjs    → Next.js ESLint config
# next.config.ts       → Next.js config
# package.json         → React/Next.js root package
# pnpm-lock.yaml       → React/Next.js lockfile
# postcss.config.mjs   → Next.js PostCSS config
# screenshot.png       → React app screenshot
# tailwind.config.ts   → React/Next.js Tailwind config
# tsconfig.json        → React/Next.js TypeScript config
```

**Structure Decision**: Single-project layout. The Vue project stays in `vue/`. After React removal there are no source files at the repository root — only project-level metadata (`README.md`, `LICENSE`, `.gitignore`) and the feature planning docs (`specs/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution §Development Workflow — Coexistence | Feature 002 is the deliberate retirement of the React project; removing it is the primary goal of the spec | Leaving React files in place cannot satisfy FR-001 ("repository MUST maintain only one interface project") or any of the success criteria; the Coexistence rule itself must be updated |
