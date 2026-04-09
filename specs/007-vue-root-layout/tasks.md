# Tasks: Padronizar Projeto Vue na Raiz

**Input**: Design documents from `/specs/007-vue-root-layout/`
**Prerequisites**: plan.md ok, spec.md ok, research.md ok, data-model.md ok, contracts/root-workspace.md ok, quickstart.md ok

**Tests**: No automated tests requested. Validation is manual from repository root plus `pnpm build` and `pnpm type-check`.

**Organization**: Tasks are grouped by user story so each outcome can be implemented and validated independently after the shared root-promotion work is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, independent)
- **[Story]**: User story tag (US1, US2, US3)

---

## Phase 1: Setup (Shared Preparation)

**Purpose**: Confirm the current nested workspace and capture a baseline before promoting files to repository root.

- [X] T001 Verify the active branch is `007-vue-root-layout` and confirm the current workspace entry points are `vue/package.json`, `vue/src/`, and `vue/public/`
- [X] T002 Record a pre-migration baseline by running `cd vue && pnpm install`, `cd vue && pnpm type-check`, and `cd vue && pnpm dev` against `vue/package.json`

**Checkpoint**: The current `vue/` workspace is known-good before any structural move begins.

---

## Phase 2: Foundational (Root Workspace Promotion)

**Purpose**: Promote the Vue workspace to repository root and remove the nested workspace as an official development path.

**CRITICAL**: No user story work should start until the root workspace exists and runs from repository root.

- [X] T003 Update root `.gitignore` using `vue/.gitignore` as input so root rules ignore `node_modules/`, `dist/`, `.vite/`, `coverage/`, editor files, and no longer depend on `vue/`-prefixed paths
- [X] T004 Promote `vue/package.json`, `vue/pnpm-lock.yaml`, `vue/vite.config.ts`, `vue/postcss.config.mjs`, `vue/components.json`, `vue/.npmrc`, `vue/index.html`, and `vue/env.d.ts` to repository root equivalents
- [X] T005 [P] Promote `vue/tsconfig.json`, `vue/tsconfig.app.json`, and `vue/tsconfig.node.json` to repository root equivalents and confirm the `@/*` alias still resolves to `src/*`
- [X] T006 [P] Promote `vue/src/` to `src/` and `vue/public/` to `public/` without changing component behavior or import aliases
- [X] T007 [P] Promote `vue/.vscode/settings.json` and `vue/.vscode/extensions.json` to `.vscode/` at repository root
- [X] T008 Remove legacy workspace-only files `vue/README.md`, `vue/.claude/settings.local.json`, and the `vue/` directory once the promoted root files exist and no compatibility path remains
- [X] T009 Validate the promoted root workspace with `pnpm install`, `pnpm type-check`, and `pnpm build` from repository root against `package.json`

**Checkpoint**: Repository root behaves like the active Vue workspace and `vue/` is no longer required to build or validate the project.

---

## Phase 3: User Story 1 - Workspace Canonico na Raiz (Priority: P1)

**Goal**: Make the repository root the single, clearly documented development workspace.

**Independent Test**: Clone the repository, stay at repo root, and confirm the working project is discoverable through `package.json`, `src/`, `public/`, and root `pnpm` commands without any `vue/` detour.

### Implementation for User Story 1

- [X] T010 [US1] Amend `.specify/memory/constitution.md` so project-location and demo-workflow clauses describe root `package.json`, `src/`, `public/`, and root `pnpm` commands instead of `vue/`
- [X] T011 [P] [US1] Update `AGENTS.md` project structure and command sections from `vue/src/` and `cd vue && pnpm ...` to `src/` and root `pnpm ...`
- [X] T012 [P] [US1] Update `CLAUDE.md` project structure and command sections from `vue/src/` and `cd vue && pnpm ...` to `src/` and root `pnpm ...`
- [X] T013 [US1] Verify the canonical root layout by auditing `package.json`, `vite.config.ts`, `src/`, `public/`, `.vscode/`, and the removed `vue/` workspace from repository root

**Checkpoint**: Contributors and coding agents can identify the canonical workspace directly at repository root.

---

## Phase 4: User Story 2 - Onboarding e Comandos Sem Ambiguidade (Priority: P2)

**Goal**: Ensure a contributor can follow the official docs and run the project from repository root without translating old paths.

**Independent Test**: A new contributor follows only `README.md`, stays at repository root, and reaches a working local environment plus the documented validation commands without seeing `cd vue`.

### Implementation for User Story 2

- [X] T014 [US2] Rewrite the development, setup, scripts, and contributing sections in `README.md` so the official flow is `git clone` -> repository root -> `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm type-check`
- [X] T015 [US2] Update the repository structure and command examples in `README.md` from `vue/...` paths to root `src/`, `public/`, and root config files

**Checkpoint**: `README.md` presents one root-based onboarding flow and no longer assumes a nested workspace.

---

## Phase 5: User Story 3 - Guia de Consumo e Referencias Externas Atualizados (Priority: P3)

**Goal**: Align component-copy guidance and public reference material with the new root source location.

**Independent Test**: A developer reading the public docs can identify `src/components/tree-view/` as the source of truth for copying or importing the component and finds no primary guidance that still points at `vue/`.

### Implementation for User Story 3

- [X] T016 [US3] Rewrite the copy, degit, and import guidance in `README.md` so component consumers use `src/components/tree-view` as the source of truth and no longer see warnings that the root path does not exist
- [X] T017 [P] [US3] Update the file-structure block in `docs/003-node-action-buttons.md` from `vue/src/` to root `src/`
- [X] T018 [P] [US3] Update the file-structure block in `docs/004-recursive-select-mode.md` from `vue/src/` to root `src/`
- [X] T019 [US3] Audit `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/003-node-action-buttons.md`, `docs/004-recursive-select-mode.md`, and `.specify/memory/constitution.md` and remove remaining primary `vue/` workspace references
- [X] T020 [US3] Verify `.github/workflows/release.yml` does not reintroduce `cd vue` or `vue/src` as an official path and update the workflow file if a stale path is present

**Checkpoint**: Public usage guidance and external-facing file references match the new root layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final audit, metadata refresh, and validation after all user stories are complete.

- [X] T021 Regenerate Codex agent metadata by running `.specify/scripts/powershell/update-agent-context.ps1 -AgentType codex` after `specs/007-vue-root-layout/plan.md` reflects the root workspace
- [X] T022 Search for stale root-layout regressions with `rg -n "cd vue|vue/src|/vue\\b" README.md AGENTS.md CLAUDE.md docs .github .specify/memory` and resolve any non-historical matches
- [X] T023 Run final smoke validation from repository root using `pnpm dev`, `pnpm type-check`, and `pnpm build`, then confirm the `README.md` commands match the working flow
- [X] T024 Commit the root-layout migration for `package.json`, `src/`, `public/`, `README.md`, `AGENTS.md`, and `CLAUDE.md` as one feature-complete change

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; establishes the baseline
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories
- **User Story 1 (Phase 3)**: Starts after Phase 2
- **User Story 2 (Phase 4)**: Starts after Phase 2
- **User Story 3 (Phase 5)**: Starts after Phase 2, but the final audit task T019 is safest after US1 and US2 updates land
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **US1**: Depends only on Phase 2 and delivers the canonical root workspace definition
- **US2**: Depends only on Phase 2 and can proceed independently of US1 implementation details
- **US3**: Depends on Phase 2; T016-T018 can start immediately, while T019 should follow the US1 and US2 documentation updates

### Within Each User Story

- Root promotion before any doc rewrite
- Constitution and agent guidance before final workspace audit
- README onboarding updates before the final path audit
- Public guide updates before the final workflow verification

### Parallel Opportunities

- T005, T006, and T007 can run in parallel after T004 starts because they touch different path groups
- T011 and T012 can run in parallel because they update different agent-guidance files
- T017 and T018 can run in parallel because they update different public docs

---

## Parallel Example: User Story 1

```bash
Task: "Update AGENTS.md project structure and command sections from vue/src/ and cd vue && pnpm ... to src/ and root pnpm ..."
Task: "Update CLAUDE.md project structure and command sections from vue/src/ and cd vue && pnpm ... to src/ and root pnpm ..."
```

---

## Parallel Example: User Story 3

```bash
Task: "Update the file-structure block in docs/003-node-action-buttons.md from vue/src/ to root src/"
Task: "Update the file-structure block in docs/004-recursive-select-mode.md from vue/src/ to root src/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 baseline checks.
2. Complete Phase 2 root promotion.
3. Complete Phase 3 canonical-workspace updates.
4. Validate the root workspace independently before expanding the documentation scope.

### Incremental Delivery

1. Promote the workspace to root and validate build/type-check from repository root.
2. Update contributor-facing onboarding in `README.md`.
3. Update consumer-facing copy/import guidance and public docs.
4. Run the final stale-path audit and smoke validation.

### Parallel Team Strategy

1. One developer handles Phase 2 file promotion and root config normalization.
2. After Phase 2, a second developer can update `AGENTS.md` and `CLAUDE.md` while another rewrites `README.md`.
3. Public guide updates in `docs/003-node-action-buttons.md` and `docs/004-recursive-select-mode.md` can run in parallel before the final audit.

---

## Notes

- `[P]` tasks touch disjoint files or directories and can be delegated safely.
- Historical references to `vue/` may remain inside older planning docs under `specs/`; active workflow docs should not.
- The feature is structural and documentation-focused; component behavior should remain unchanged throughout the migration.
