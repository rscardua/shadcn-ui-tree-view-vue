# Implementation Plan: Padronizar Projeto Vue na Raiz

**Branch**: `007-vue-root-layout` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-vue-root-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Promote the existing Vue/Vite component workspace from `vue/` to the repository root so the root becomes the single canonical development entry point. The migration moves the working project files intact, removes `/vue` as an official workspace without a compatibility layer, and rewrites onboarding and consumption docs so all commands and source paths point to the new root layout.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode) + Markdown documentation  
**Primary Dependencies**: Vue 3.5+, Vite, Reka UI, @lucide/vue, @vueuse/core, Tailwind CSS v4  
**Storage**: N/A (file-system reorganization only)  
**Testing**: Manual root-workspace validation with `pnpm dev`, plus `pnpm build` and `pnpm type-check` after migration  
**Target Platform**: GitHub repository and local Node.js development environment  
**Project Type**: Component library + demo app; repository layout migration  
**Performance Goals**: No functional or visual regressions in the existing tree view demo after promotion to root  
**Constraints**: No intentional component behavior changes; no compatibility path that keeps `/vue` as an official workflow; preserve `specs/` and repository history; keep scope limited to structural and documentation changes  
**Scale/Scope**: Promote one existing Vue workspace (`src/`, `public/`, root config files, editor settings) and update the official docs and agent guidance that currently point at `vue/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | PASS | Existing reusable SFC structure remains intact; files are relocated, not redesigned |
| II. Vue 3 Idioms | PASS | `script setup`, Composition API, typed props/emits, and current project conventions remain unchanged |
| III. Accessibility | PASS | No intended behavior change to tree interaction or ARIA behavior |
| IV. Slot-Based Extensibility | PASS | Slot API is preserved; migration only changes repository paths |
| V. Feature Parity | PASS | Feature scope explicitly forbids intentional behavior changes |
| Technology Standards - Project location | JUSTIFIED VIOLATION | The constitution still says the project lives under `vue/`; feature 007 intentionally changes the canonical workspace to repository root and must amend the constitution |
| Development Workflow - Demo application | JUSTIFIED VIOLATION | The workflow text still says the demo app lives under `vue/`; it must be rewritten to describe the root workspace after promotion |

**Post-Phase 1 re-check**: All five core principles still pass. The two location-specific workflow statements remain justified amendments that must be updated as part of implementation so the constitution matches the migrated repository.

## Project Structure

### Documentation (this feature)

```text
specs/007-vue-root-layout/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- root-workspace.md
`-- tasks.md
```

### Source Code (repository root)

```text
.specify/                     # Planning toolchain retained at root
.github/workflows/release.yml # Existing automation to re-verify against the new layout
.vscode/                      # Workspace editor settings promoted from vue/.vscode/
public/                       # Static assets promoted from vue/public/
src/
|-- App.vue
|-- main.ts
|-- assets/index.css
|-- components/
|   |-- tree-view/
|   `-- ui/
`-- lib/
.npmrc                        # Promoted from vue/.npmrc
.gitignore                    # Merged root + Vue ignore rules for the new canonical workspace
AGENTS.md                     # Updated to root commands and source paths
CLAUDE.md                     # Updated to root commands and source paths
README.md                     # Updated onboarding + consumption docs
components.json               # Promoted shadcn-vue config
env.d.ts                      # Promoted Vite/Vue type shim
index.html                    # Promoted Vite entry HTML
package.json                  # Promoted Vue workspace package manifest
pnpm-lock.yaml                # Promoted lockfile
postcss.config.mjs            # Promoted PostCSS config
tsconfig.json                 # Promoted TS project references
tsconfig.app.json             # Promoted app TS config
tsconfig.node.json            # Promoted Node/Vite TS config
vite.config.ts                # Promoted Vite config
specs/                        # Feature planning docs retained
docs/                         # Public component guides updated to root paths
```

**Structure Decision**: Single-project repository rooted at `/`. The current Vue/Vite app is promoted intact from `vue/` into the repository root so contributors run `pnpm ...` directly from the clone root and copy source files from `src/components/tree-view/` without a `vue/` prefix.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution clauses referencing `vue/` as the project location | Feature 007 explicitly changes the canonical workspace to repository root | Leaving the constitution untouched would contradict FR-001, FR-002, FR-004, and FR-009 and would mislead contributors and agents |
| Immediate cutover with no `vue/` compatibility path | The spec requires `/vue` to stop being an official workspace immediately | Keeping a mirrored or fallback `vue/` path would preserve ambiguity and fail the single-workspace success criteria |
