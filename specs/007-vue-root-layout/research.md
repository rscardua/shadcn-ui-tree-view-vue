# Research: Padronizar Projeto Vue na Raiz

**Branch**: `007-vue-root-layout` | **Date**: 2026-04-08

---

## Decision 1: Promotion strategy for the Vue workspace

- **Decision**: Promote the existing tracked Vue workspace files from `vue/` to the repository root instead of scaffolding a new root app and copying code into it.
- **Rationale**: The current Vue project already builds and contains the correct aliases, Vite config, TypeScript references, and source tree. Promoting those files preserves working configuration and minimizes behavioral risk.
- **Alternatives considered**: Create a fresh root Vite workspace and manually copy `vue/src/` over - rejected because it creates avoidable diff noise and increases the chance of configuration drift.

---

## Decision 2: No compatibility layer for `/vue`

- **Decision**: Remove `vue/` as an official workspace immediately after promotion and do not keep a mirrored directory, fallback commands, or legacy onboarding path.
- **Rationale**: FR-009 and the approved clarification require an immediate cutover. Any compatibility layer would preserve the ambiguity the feature is trying to remove.
- **Alternatives considered**: Keep `vue/` as a secondary entry point or symlink - rejected because it would fail the single canonical workspace requirement and keep contributors split across two path conventions.

---

## Decision 3: Root config and ignore strategy

- **Decision**: Promote the Vue workspace config files (`package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `tsconfig*.json`, `components.json`, `.npmrc`, `index.html`, `env.d.ts`, `postcss.config.mjs`) to repository root and merge `vue/.gitignore` into the existing root `.gitignore`.
- **Rationale**: After promotion, the root must behave exactly like the current `vue/` directory. Ignored outputs also need to follow the new root execution path (`node_modules/`, `dist/`, `.vite/`, `coverage/`) instead of `vue/`-prefixed paths.
- **Alternatives considered**: Keep both `.gitignore` files and rely on nested ignore rules - rejected because it leaves root behavior implicit and increases confusion about which workspace is canonical.

---

## Decision 4: Documentation scope for the migration

- **Decision**: Treat `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/003-node-action-buttons.md`, `docs/004-recursive-select-mode.md`, and `.specify/memory/constitution.md` as the official documents that must be updated for the new root layout.
- **Rationale**: Those files currently describe development commands, source paths, or public component structure. Leaving any of them on the old path would undermine onboarding and external reuse guidance.
- **Alternatives considered**: Update only `README.md` - rejected because contributor and agent guidance would still point at `vue/`, violating FR-003, FR-004, and FR-008.

---

## Decision 5: Disposition of `vue/README.md` and editor settings

- **Decision**: Promote `vue/.vscode/` to root `.vscode/` so the repository root retains editor settings, and remove `vue/README.md` with the legacy workspace rather than keeping a second README under an inactive path.
- **Rationale**: Once the root becomes canonical, nested workspace settings should follow it. Keeping `vue/README.md` would imply that the old directory still has a supported role.
- **Alternatives considered**: Leave `vue/.vscode/` and `vue/README.md` in place - rejected because they anchor editor and reader behavior to a directory that should no longer exist as an official workspace.

---

## Decision 6: Validation strategy after promotion

- **Decision**: Validate the migrated workspace from repository root with `pnpm install`, `pnpm dev`, `pnpm build`, and `pnpm type-check`, and use a repository-wide path audit to catch stale `vue/` references in official docs.
- **Rationale**: The feature's success criteria are about discoverability and correctness of the root workflow. Root-level command validation and path auditing directly test those outcomes.
- **Alternatives considered**: Rely on file moves alone without command validation - rejected because the feature could appear structurally complete while still failing the official onboarding flow.

---

## Decision 7: Workflow file treatment

- **Decision**: Re-verify `.github/workflows/release.yml` against the new root layout and update it only if the migration exposes stale `vue/`-specific paths.
- **Rationale**: The feature scope is structural migration and documentation alignment, not a workflow redesign. The workflow should only change if it still references the retired path convention.
- **Alternatives considered**: Rewrite automation preemptively - rejected because it broadens scope without a spec requirement.
