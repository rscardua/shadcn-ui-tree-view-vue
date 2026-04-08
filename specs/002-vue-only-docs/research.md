# Research: Consolidar Projeto de Interface

**Branch**: `002-vue-only-docs` | **Date**: 2026-04-08

---

## Decision 1: Vue project location after React removal

- **Decision**: Keep the Vue project in its current `vue/` subdirectory. Do not move its contents to the repository root.
- **Rationale**: All internal paths in `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, and the Tailwind/PostCSS configs are relative to `vue/`. Moving files to root would require updating every path reference without delivering any user value.
- **Alternatives considered**: Promoting `vue/` contents to the repository root (flatter structure) — rejected because the migration scope explicitly excludes code changes and the disruption risk outweighs the marginal organizational benefit.

---

## Decision 2: Root-level files to remove

- **Decision**: Remove all React/Next.js project files from the repository root:
  - Directories: `app/`, `components/`, `lib/`, `public/`
  - Config files: `next.config.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `components.json`
  - Dependency files: root `package.json`, root `pnpm-lock.yaml`
  - Media: `screenshot.png`
  - Scripts: `scripts/create-schema.js` (reads `components/tree-view.tsx` which is removed)
- **Rationale**: All of the above are exclusively tied to the Next.js/React project. Retaining them after the project is removed creates dead code and misleads contributors about the repository's technology stack.
- **Alternatives considered**: Archiving files in a `legacy/` branch instead of deleting — rejected because git history already preserves the React code; adding a `legacy/` directory maintains the ambiguity the spec targets.

---

## Decision 3: Root-level files to retain

- **Decision**: Retain and update:
  - `README.md` — rewrite to document the Vue component library
  - `CLAUDE.md` — update project structure paths and commands
  - `.gitignore` — update patterns for Vite/Vue; remove Next.js-specific entries
  - `LICENSE` — unchanged (project-level, not framework-specific)
  - `specs/` — unchanged (feature planning docs)
  - `vue/` — unchanged (the Vue project itself)
- **Rationale**: These files are either project-wide metadata or the Vue project, and each serves a clear ongoing purpose.
- **Alternatives considered**: Removing the root `.gitignore` and relying on `vue/.gitignore` — rejected because blanket entries like `.DS_Store` and `*.pem` should apply to the entire repository, not just the `vue/` directory.

---

## Decision 4: `.gitignore` update strategy

- **Decision**: Replace Next.js-specific ignore patterns (`/.next/`, `/out/`) with Vite patterns covering `vue/dist/`. Retain generic entries (`.DS_Store`, `*.pem`, debug logs). Remove `/coverage`, `/build`, `/node_modules` from root level since there will be no root-level `node_modules` after removing the root `package.json`.
- **Rationale**: The current `.gitignore` is completely Next.js-oriented. After removal of the root `package.json`, root-level dependency directories cannot exist, so most patterns are redundant. A clean Vite-oriented root `.gitignore` reduces confusion.
- **Alternatives considered**: Leaving `.gitignore` unchanged — rejected because stale entries for `/.next/` and `/out/` are misleading.

---

## Decision 5: README.md rewrite strategy

- **Decision**: Rewrite `README.md` as the Vue component library's authoritative project page. Structure: project overview → requirements → installation (Vue/pnpm based) → component API (Props, Emits, Slots) → usage example → development setup → contributing.
- **Rationale**: The current README documents the React API exclusively (React props, JSX imports, `framer-motion`, Radix React). It will be completely wrong after the Vue project becomes the only implementation. The Vue component API is already defined in the feature 001 contract (`specs/001-vue3-migration/contracts/component-api.md`) and can be referenced directly.
- **Alternatives considered**: Keeping the React README and adding a Vue section — rejected; the spec requires eliminating conflicting references, not appending alternative paths.

---

## Decision 6: `vue/README.md` disposition

- **Decision**: Leave `vue/README.md` as-is (generic Vite template stub). It serves as a secondary, locally-scoped development reference inside the `vue/` directory.
- **Rationale**: After the root `README.md` becomes the full project guide, the `vue/README.md` remains useful as a quick reference for contributors who open the `vue/` subdirectory directly. Rewriting both files is unnecessary duplication.
- **Alternatives considered**: Deleting `vue/README.md` — rejected; some editors and GitHub show per-directory README files.

---

## Decision 7: `CLAUDE.md` update strategy

- **Decision**: Update `CLAUDE.md` to correct the project structure (currently shows `src/` and `tests/` — those are from the generic template and do not exist) and commands (currently shows `npm test; npm run lint` but the Vue project uses `pnpm`).
- **Rationale**: CLAUDE.md is used by AI coding agents to orient themselves in the codebase. Incorrect paths and commands cause wasted context lookups and wrong tool invocations.
- **Alternatives considered**: Removing CLAUDE.md — rejected; it is the agent coordination file and must stay accurate.

---

## Decision 8: Constitution amendment required

- **Decision**: The constitution's **Development Workflow — Coexistence** principle ("The existing React/Next.js code MUST remain untouched in its current location") must be updated as part of this feature. The updated principle should reflect that the React project has been retired and `vue/` is the sole codebase.
- **Rationale**: The Coexistence rule was deliberately written for the Vue migration phase (feature 001). It was a temporary protection to prevent React files from being accidentally modified during migration. Feature 002 is the explicit end of that migration era, so the rule must be updated to avoid misleading future contributors.
- **Alternatives considered**: Leaving the constitution unchanged — rejected; an outdated principle that contradicts the actual codebase state undermines the constitution's authority.

---

## Decision 9: `scripts/` directory after consolidation

- **Decision**: Remove `scripts/create-schema.js`. The `scripts/` directory itself can be removed if no other scripts exist (currently it contains only this one file).
- **Rationale**: `create-schema.js` reads `components/tree-view.tsx` (React file) to generate a `schema.json` for the shadcn/ui React registry. After the React component is removed, this script is broken and purposeless. A Vue-equivalent registry entry would be a separate future task.
- **Alternatives considered**: Updating the script to reference the Vue component — out of scope; this feature is consolidation only, not new Vue tooling.
