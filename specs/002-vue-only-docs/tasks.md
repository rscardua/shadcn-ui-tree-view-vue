# Tasks: Consolidar Projeto de Interface

**Input**: Design documents from `/specs/002-vue-only-docs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/readme-structure.md ✅, quickstart.md ✅

**Tests**: Not requested — this feature is structural/documentation only; verification is manual (follow docs and reach a working dev environment).

**Organization**: Tasks grouped by user story to enable independent, incremental delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, independent)
- **[Story]**: User story tag (US1, US2, US3)

---

## Phase 1: Setup (Shared Preparation)

**Purpose**: Confirm current state of the repository before any destructive removal begins.

- [X] T001 Verify current branch is `002-vue-only-docs` (run `git branch --show-current` in repo root and confirm output)
- [X] T002 Confirm Vue demo app starts cleanly before changes: `cd vue && pnpm install && pnpm dev` — verify http://localhost:5173 loads tree view, then stop the server

**Checkpoint**: Vue project works. Safe to remove React files.

---

## Phase 2: Foundational (React Project Removal)

**Purpose**: Remove all React/Next.js artifacts from the repository root. This must be complete before any documentation tasks begin, because documentation tasks must reference only what will remain.

**⚠️ CRITICAL**: All US1, US2, US3 tasks depend on this phase.

- [X] T003 Delete directory `app/` from repository root (contains `globals.css`, `layout.tsx`, `page.tsx`)
- [X] T004 [P] Delete directory `components/` from repository root (contains `tree-view.tsx` and all `ui/` React components)
- [X] T005 [P] Delete directory `lib/` from repository root (contains `demo_data.ts` and `utils.ts`)
- [X] T006 [P] Delete directory `public/` from repository root (contains Next.js favicon assets and `site.webmanifest`)
- [X] T007 [P] Delete directory `scripts/` from repository root (contains only `create-schema.js` which reads the removed React component)
- [X] T008 [P] Delete file `components.json` from repository root (shadcn/ui React config)
- [X] T009 [P] Delete file `eslint.config.mjs` from repository root (Next.js ESLint config)
- [X] T010 [P] Delete file `next.config.ts` from repository root
- [X] T011 [P] Delete file `package.json` from repository root (React/Next.js root package — NOT `vue/package.json`)
- [X] T012 [P] Delete file `pnpm-lock.yaml` from repository root (React/Next.js lockfile — NOT `vue/pnpm-lock.yaml`)
- [X] T013 [P] Delete file `postcss.config.mjs` from repository root (Next.js PostCSS config — NOT `vue/postcss.config.mjs`)
- [X] T014 [P] Delete file `screenshot.png` from repository root (React app screenshot)
- [X] T015 [P] Delete file `tailwind.config.ts` from repository root (Next.js Tailwind config)
- [X] T016 [P] Delete file `tsconfig.json` from repository root (React/Next.js TypeScript config — NOT any file under `vue/`)
- [X] T017 Verify removal: run `git status` and confirm all 14 items above appear as deleted; confirm `vue/` directory and its contents are untouched

**Checkpoint**: Repository root contains only `vue/`, `specs/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `LICENSE`, `.gitignore`, and `.git/`. No React/Next.js file remains.

---

## Phase 3: User Story 1 — Base Única de Desenvolvimento (Priority: P1) 🎯 MVP

**Goal**: The repository retains a single interface project (`vue/`) and no references to the removed React project exist in retained files.

**Independent Test**: Clone the repository, inspect the root directory — only `vue/` is present as a development entry point. No `app/`, `components/`, `lib/` directories. The `vue/` project starts successfully with `cd vue && pnpm dev`.

### Implementation for User Story 1

- [X] T018 [US1] Update `.gitignore` at repository root: remove `/.next/`, `/out/`, `/coverage`, `/build`, root-level `/node_modules` entries; add `vue/dist/` and `vue/.vite/`; retain `.DS_Store`, `*.pem`, and debug log patterns
- [X] T019 [US1] Amend `.specify/memory/constitution.md` — update the **Coexistence** principle under "Development Workflow": replace "The existing React/Next.js code MUST remain untouched in its current location. Vue code lives exclusively under `vue/`." with "Vue code lives under `vue/`. The React/Next.js implementation has been retired (feature 002). There is no coexistence requirement."

**Checkpoint**: Cloning the repository and running `git ls-files` at the root shows no React or Next.js files. The `.gitignore` has only Vite-relevant patterns. The constitution no longer protects the removed React project.

---

## Phase 4: User Story 2 — Documentação de Onboarding Clara (Priority: P2)

**Goal**: A contributor with no prior context can follow the documentation alone and start the Vue dev environment within 15 minutes.

**Independent Test**: Ler apenas README.md em português em um clone limpo, seguir as instruções passo a passo e subir `pnpm dev` em http://localhost:5173 sem consultar fontes externas. O documento deve conter créditos explícitos ao autor da fork e nota de continuidade com conversão assistida por IA.

### Implementation for User Story 2

- [X] T020 [US2] Reescrever README.md na raiz seguindo specs/002-vue-only-docs/contracts/readme-structure.md, em português, com as 9 seções obrigatórias (título, placeholder de screenshot, lista de features, tabela de requisitos, instalação A+B, API do componente com Props/Emits/Slots de specs/001-vue3-migration/contracts/component-api.md, exemplo em Vue SFC, comandos de desenvolvimento e contribuição); manter regras de conteúdo (sem JSX, sem imports React, sem framer-motion, comandos com pnpm e prefixo cd vue/ quando necessário)
- [X] T021 [US2] Adicionar em README.md uma seção de créditos com referência explícita ao autor da fork original (repositório base) e uma nota clara de que esta versão foi convertida para Vue com apoio de IA e recebeu continuidade de manutenção
- [X] T022 [US2] Update CLAUDE.md at repository root: replace the Project Structure section (currently shows src/ and tests/) with the actual post-consolidation layout (vue/src/, vue/src/components/tree-view/, vue/src/components/ui/, etc.); replace the Commands section (currently npm test; npm run lint) with cd vue && pnpm dev, cd vue && pnpm build, cd vue && pnpm type-check

**Checkpoint**: `README.md` passes all content rules from `contracts/readme-structure.md`. `CLAUDE.md` references only paths that exist in the repository. A fresh reader can clone, `cd vue/`, `pnpm install`, `pnpm dev` and reach the demo.

---

## Phase 5: User Story 3 — Redução de Ambiguidade Operacional (Priority: P3)

**Goal**: No instruction or link anywhere in the retained repository files points to a conflicting or non-existent development path.

**Independent Test**: Audit all retained Markdown files (`README.md`, `CLAUDE.md`, `specs/**/*.md`) — find zero references to `framer-motion`, `@radix-ui/react-*`, `lucide-react`, `npx shadcn@latest`, `npm run dev` (Next.js), the root `package.json`, or any of the deleted directories.

### Implementation for User Story 3

- [X] T023 [P] [US3] Search all retained Markdown files for stale React/Next.js references: run `grep -r "framer-motion\|radix-ui/react\|lucide-react\|next\.config\|app/layout\|npx shadcn" --include="*.md" .` from repo root; fix or remove any matches found outside specs/002-vue-only-docs/ planning docs (planning docs may reference old tech for research purposes)
- [X] T024 [P] [US3] Search all retained Markdown files for stale path references to removed directories: run `grep -r "components/tree-view\|app/page\|lib/demo_data\|scripts/create-schema\|public/favicon" --include="*.md" .` from repo root; fix or remove any matches found outside planning docs
- [X] T025 [US3] Validate README.md language and attribution requirements: confirm the main onboarding text is in Portuguese, confirm a visible credits section cites the original fork author, and confirm the text states that the Vue version was converted with IA support and continued by current maintainers
- [X] T026 [US3] Verify AGENTS.md (auto-updated by update-agent-context.ps1 during planning) contains correct technology entries for feature 002 and no stale React entries that could misdirect an AI coding agent

**Checkpoint**: `grep` passes clean (zero hits for React/stale patterns in operational docs). `AGENTS.md` accurately reflects the Vue-only stack.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification pass — ensures all three user stories work together and the repository is contribution-ready.

- [X] T027 Verify Vue project still starts after all changes: `cd vue && pnpm install && pnpm dev` — confirm http://localhost:5173 loads the tree view demo (no regressions from any accidental edits)
- [X] T028 Commit all changes with a descriptive message per the constitution's one-commit-per-logical-unit rule; suggested message: `feat(002): remove React project and update docs for Vue-only repository`

---

## Dependencies

```
T001 → T002 → T003..T016 (Phase 2 removal)
                              ↓
                         T017 (verify removal)
                              ↓
              ┌──────────────────────────────────────┐
              ↓                                      ↓
         T018, T019                              T020, T021, T022
         (US1 — baseline)                        (US2 — docs)
              ↓                                      ↓
         T023, T024, T025, T026                  (US3 — audit)
              └───────────────────────────────────┘
                                ↓
                          T027, T028
                          (Polish + Commit)
```

**Key dependency**: Phase 2 (removal) must be fully complete before any documentation can be written or audited, because the docs describe the post-consolidation state.

**Independent stories**: US1 (`.gitignore`, constitution) and US2 (`README.md`, `CLAUDE.md`) can proceed in parallel after Phase 2. US3 depends on US1 and US2 being complete (it audits their output).

---

## Parallel Execution

### After Phase 2 checkpoint (T017 complete):

| Worker A | Worker B |
|----------|----------|
| T018 — update `.gitignore` | T020 — rewrite `README.md` |
| T019 — amend constitution | T021 + T022 — concluir README (créditos) e atualizar `CLAUDE.md` |
| T023 — audit stale tech refs | T024 — audit stale path refs |

### Within Phase 2 (T003 must start first; T004–T016 can all run in parallel):

T004, T005, T006, T007, T008, T009, T010, T011, T012, T013, T014, T015, T016 are all independent file/directory deletions — no ordering between them.

---

## Implementation Strategy

**MVP scope** (User Story 1 only — P1):
1. Complete Phase 2 (remove React files)
2. Run T018 (update `.gitignore`)
3. Run T019 (amend constitution)
4. Result: repository passes "single interface project" criterion; Vue project unaffected

**Full delivery** adds US2 (documentation rewrite) and US3 (audit pass) for a fully contribution-ready repository.

**Risk**: T011 (remove root `package.json`) and T012 (remove root `pnpm-lock.yaml`) — double-check paths before deletion; the `vue/` equivalents must not be removed.
