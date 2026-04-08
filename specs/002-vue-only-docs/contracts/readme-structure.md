# README Structure Contract

**Branch**: `002-vue-only-docs` | **Date**: 2026-04-08  
**Scope**: Root `README.md` — the authoritative public-facing project page after React removal

---

## Purpose

This contract defines the required structure, content rules, and validation criteria for the rewritten `README.md`. It ensures the document serves as the single entry point for anyone discovering the project on GitHub, replacing the React-only documentation with Vue-oriented content.

---

## Required Sections (in order)

### 1. Project Headline

```markdown
# Shadcn/ui Tree View (Vue)
```

- One-sentence description of the component's purpose
- Technology badges (optional): Vue 3, TypeScript, Reka UI, Tailwind CSS

### 2. Screenshot / Demo

- A screenshot or animated GIF of the rendered tree view
- Alt text must describe the UI state shown
- Note: a Vue-generated screenshot replaces `screenshot.png` (React); can be deferred

### 3. Features List

Bullet list covering all six capabilities:
- Tree rendering with expand/collapse
- Selection (single, multi, range, drag)
- Search/filter
- Checkboxes with cascade (parent/child sync)
- Context menus
- Hover cards

### 4. Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| pnpm | 8+ |

### 5. Installation

#### Option A: Development (clone + run)

```bash
git clone https://github.com/neigebaie/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue/vue
pnpm install
pnpm dev
```

#### Option B: Copy component (manual integration)

Step-by-step instructions for copying `vue/src/components/tree-view/` into a target project — including required shadcn-vue UI primitives and dependencies.

### 6. Component API

Must include all interfaces from `specs/001-vue3-migration/contracts/component-api.md`:

#### Props (`TreeViewProps`)
All props documented in a table: name | type | default | description

#### Emits (`TreeViewEmits`)
All events: `selection-change`, `check-change`, `action`

#### Slots (`TreeViewSlots`)
All slots: `icon`, `label` — with available slot props

#### Interfaces
- `TreeViewItem` (id, name, type, children?, checked?)
- `TreeViewMenuItem` (id, label, icon?, action)

### 7. Usage Example

Complete, runnable Vue SFC example:

```vue
<script setup lang="ts">
import { TreeView } from '@/components/tree-view'
// ...
</script>

<template>
  <TreeView :data="..." @selection-change="..." />
</template>
```

### 8. Development Setup

```bash
cd vue/
pnpm install
pnpm dev          # Start dev server at http://localhost:5173
pnpm build        # Production build
pnpm type-check   # TypeScript validation (vue-tsc)
```

### 9. Contributing

- Link to the `specs/` directory for feature planning workflow
- Brief note: one contribution per commit, demo app must run before PR

---

## Content Rules (validation)

| Rule | Description |
|------|-------------|
| NO_JSX | No JSX syntax anywhere in README |
| NO_REACT_IMPORTS | No `import ... from 'react'` or `@radix-ui/react-*` |
| NO_FRAMER | No `framer-motion` references |
| NO_NEXTJS | No `next`, `npx shadcn@latest`, `npm run dev` (Next.js) |
| VUE_SYNTAX | All code examples use `<script setup lang="ts">` + `<template>` |
| API_COMPLETE | All Props, Emits, Slots from component-api.md are documented |
| PNPM_ONLY | All install/run commands use `pnpm`, not `npm` or `yarn` |
| SUBDIR_AWARE | All commands that run inside `vue/` explicitly `cd vue/` first |

---

## Out of Scope

- Changelog / release history section (separate file if needed)
- Detailed accessibility documentation (belongs in component docs)
- CI/CD badges (no CI configured yet)
