# Root Workspace Contract

**Branch**: `007-vue-root-layout` | **Date**: 2026-04-08  
**Scope**: Canonical repository structure, commands, and public path references after promoting the Vue project to repository root

---

## Purpose

This contract defines the repository interface that contributors and external consumers must see after the migration. It focuses on where the workspace lives, how commands are run, and which source paths public docs are allowed to reference.

---

## Canonical Root Commands

All official commands must run from repository root:

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
```

### Validation Rules

- No official command example may require `cd vue`.
- `README.md`, `AGENTS.md`, and `CLAUDE.md` must all show the same root command surface.

---

## Required Root Layout

The repository root must expose at least these paths after migration:

```text
package.json
pnpm-lock.yaml
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
postcss.config.mjs
components.json
index.html
env.d.ts
public/
src/
.vscode/
README.md
AGENTS.md
CLAUDE.md
docs/
specs/
```

### Validation Rules

- `src/` and `public/` must exist at root.
- `vue/` must not remain as an official workspace path after promotion is complete.

---

## Source and Copy Path Rules

### Development Source Paths

- Official component source path: `src/components/tree-view/`
- Official UI primitive path: `src/components/ui/`
- Official library helper path: `src/lib/`

### Public Copy Guidance

- README copy/degit examples must use `src/components/tree-view`
- Import examples may continue to use `@/components/...` aliases, assuming `@` resolves to `src/`

### Validation Rules

- No official public guide may say that the root `src/components/tree-view` path does not exist.
- No official public guide may present `vue/src/components/tree-view` as the primary source path.

---

## Documentation Alignment Rules

The following files must describe the migrated layout consistently:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/003-node-action-buttons.md`
- `docs/004-recursive-select-mode.md`
- `.specify/memory/constitution.md`

### Validation Rules

- Root paths and commands must be consistent across all of the files above.
- Historical planning docs under `specs/` may still mention `vue/` only when describing past repository states.

---

## Forbidden Primary References

These references are not allowed in official current-state docs after migration:

- `cd vue`
- `vue/package.json`
- `vue/src/`
- `vue/public/`
- `/vue` as the active workspace

Any such reference must either be removed, rewritten to the root path, or clearly marked as historical context outside the official workflow.
