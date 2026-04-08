# Data Model: Padronizar Projeto Vue na Raiz

**Branch**: `007-vue-root-layout` | **Date**: 2026-04-08

---

## Overview

This is a repository-structure migration. The "data model" is the set of filesystem artifacts and path conventions that define where contributors build, run, and copy the Vue tree-view project.

---

## Entity: Canonical Workspace

| Field | Current State | Target State |
|-------|---------------|--------------|
| Official development root | `vue/` | Repository root `/` |
| Package manifest | `vue/package.json` | `package.json` |
| Source tree | `vue/src/` | `src/` |
| Public assets | `vue/public/` | `public/` |
| Dev/build commands | `cd vue && pnpm ...` | `pnpm ...` from root |
| Legacy path policy | `vue/` is the only official workspace today | `vue/` must no longer be an official path or compatibility layer |

### Validation Rules

- After migration, a new contributor must be able to clone the repo and run `pnpm install` and `pnpm dev` from repository root.
- No official documentation may require entering `vue/` first.

---

## Entity: Root Workspace Files

| Path Group | Action | Notes |
|------------|--------|-------|
| `vue/package.json`, `vue/pnpm-lock.yaml` | Promote to root | Root becomes the active pnpm workspace |
| `vue/vite.config.ts`, `vue/postcss.config.mjs`, `vue/components.json`, `vue/.npmrc`, `vue/index.html`, `vue/env.d.ts` | Promote to root | Preserve the existing Vite and shadcn-vue setup |
| `vue/tsconfig.json`, `vue/tsconfig.app.json`, `vue/tsconfig.node.json` | Promote to root | Keep TypeScript project references and alias behavior intact |
| `vue/src/`, `vue/public/` | Promote to root | Functional Vue code remains unchanged; only paths change |
| `vue/.vscode/` | Promote to root `.vscode/` | Preserve editor recommendations and workspace settings |
| `vue/README.md`, `vue/.claude/settings.local.json`, `vue/` | Remove after promotion | Old workspace must not remain as an official development entry point |

### Validation Rules

- Root equivalents must exist before the legacy `vue/` directory is removed.
- Promoted files must keep the same runtime behavior and alias assumptions as the current `vue/` workspace.

---

## Entity: Development Documentation

| Artifact | Role | Required Change |
|----------|------|-----------------|
| `README.md` | Public onboarding and development guide | Replace root workflow, repository structure, and command examples so they use the root workspace only |
| `AGENTS.md` | Codex agent guidance | Replace `vue/src/` structure and `cd vue && pnpm ...` commands with root paths and commands |
| `CLAUDE.md` | Agent guidance for Claude | Replace `vue/src/` structure and `cd vue && pnpm ...` commands with root paths and commands |
| `.specify/memory/constitution.md` | Project standards | Amend project-location and demo-workflow clauses that currently assume the app lives under `vue/` |

### Validation Rules

- Each file above must name a single canonical workspace at repository root.
- No updated development document may present `vue/` as a current primary workflow.

---

## Entity: Component Consumption Guide

| Artifact | Current Risk | Target Rule |
|----------|--------------|-------------|
| `README.md` copy/degit section | Tells users the root source path does not exist and points them to `vue/src/components/tree-view` | Must point to `src/components/tree-view` as the source of truth |
| `docs/003-node-action-buttons.md` | File-structure block points to `vue/src/` | Must point to `src/` |
| `docs/004-recursive-select-mode.md` | File-structure block points to `vue/src/` | Must point to `src/` |

### Validation Rules

- A developer reusing the component must be able to identify the copy source path in under 2 minutes using only the official docs.
- Import examples must remain alias-based (`@/components/...`) and aligned with the promoted root structure.

---

## Entity: Legacy Path Reference

| Field | Value |
|-------|-------|
| Definition | Any primary workflow instruction or source-path reference that still treats `vue/` as the active workspace |
| Allowed Scope | Historical references inside older planning docs may remain for context |
| Disallowed Scope | `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/*.md`, `.specify/memory/constitution.md`, and active workflow docs |

### Validation Rules

- Repository audit over official docs and workflow files must find zero primary references requiring `cd vue`, `vue/src`, or `/vue` as the active path.

---

## State Transition

```text
CURRENT STATE                     TARGET STATE
-------------                     ------------
Root = meta files only       ->   Root = canonical Vue workspace
vue/package.json             ->   package.json
vue/src/                     ->   src/
vue/public/                  ->   public/
cd vue && pnpm dev           ->   pnpm dev
README points to vue/...     ->   README points to root src/...
vue/ remains active          ->   vue/ retired with no compatibility path
```
