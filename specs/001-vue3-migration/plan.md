# Implementation Plan: Vue 3 Tree View Migration

**Branch**: `001-vue3-migration` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-vue3-migration/spec.md`

## Summary

Migrate the existing React/Next.js tree view component (1,048 lines) to Vue 3, maintaining complete feature parity across all six feature areas (tree rendering, selection, search, checkboxes, context menus, hover cards). The Vue implementation will use Composition API with `<script setup>`, TypeScript, shadcn-vue (built on Reka UI), and Tailwind CSS v4, structured as composable-driven SFCs with `provide`/`inject` for state sharing in the recursive tree. The Vue code lives in `vue/` at the repo root, coexisting with the React code.

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3.5+
**Primary Dependencies**: Reka UI (headless primitives), shadcn-vue (styled components), @lucide/vue (icons), Tailwind CSS v4
**Storage**: N/A (stateless UI component)
**Testing**: Manual verification via demo app (no automated test framework specified)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: UI component library with demo application
**Performance Goals**: 500+ nodes without jank, <100ms selection response, <200ms search filter, <300ms checkbox cascade
**Constraints**: Feature parity with React implementation, WAI-ARIA Treeview compliance, Vue 3 best practices
**Scale/Scope**: Single component library (~10 SFC files, ~5 composables, ~9 shadcn-vue UI components)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Component-First | PASS | TreeView and TreeItem are self-contained SFCs. Shared logic in composables. No global state. `provide`/`inject` with defaults for independence. |
| II. Vue 3 Idioms | PASS | All components use `<script setup lang="ts">`, type-based `defineProps`/`defineEmits`, `ref`/`computed`/`watch`, typed `InjectionKey` symbols. No Options API, no `this`. |
| III. Accessibility | PASS | WAI-ARIA Treeview pattern implemented: `role="tree"/"treeitem"/"group"`, `aria-expanded/selected/checked`, roving tabindex, full keyboard nav (Arrow keys, Enter, Space, Home, End). |
| IV. Slot-Based Extensibility | PASS | Scoped slots for icon (item + depth) and label (item) customization. Prop-based iconMap as default, slots override when provided. |
| V. Feature Parity | PASS | All 6 feature areas preserved: tree rendering, selection (4 modes), search/filter, checkbox cascade, context menus, hover cards. Badge indicators, expand all/collapse all included. |

**Gate result**: PASS — no violations. Complexity Tracking section not needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-vue3-migration/
├── plan.md              # This file
├── research.md          # Phase 0: technology decisions
├── data-model.md        # Phase 1: entities, state, provide/inject keys
├── quickstart.md        # Phase 1: setup and verification guide
├── contracts/
│   └── component-api.md # Phase 1: props, emits, slots, keyboard, ARIA
└── tasks.md             # Phase 2: task breakdown (created by /speckit.tasks)
```

### Source Code (repository root)

```text
vue/
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── assets/
│   │   └── index.css
│   ├── components/
│   │   ├── tree-view/
│   │   │   ├── TreeView.vue
│   │   │   ├── TreeItem.vue
│   │   │   ├── types.ts
│   │   │   ├── keys.ts
│   │   │   ├── utils.ts
│   │   │   └── composables/
│   │   │       ├── useTreeSelection.ts
│   │   │       ├── useTreeSearch.ts
│   │   │       ├── useTreeCheckbox.ts
│   │   │       ├── useTreeKeyboard.ts
│   │   │       └── useTreeDragSelect.ts
│   │   └── ui/
│   │       ├── badge/
│   │       ├── button/
│   │       ├── checkbox/
│   │       ├── collapsible/
│   │       ├── context-menu/
│   │       ├── dialog/
│   │       ├── hover-card/
│   │       ├── input/
│   │       └── scroll-area/
│   └── lib/
│       ├── utils.ts
│       └── demo-data.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── components.json
```

**Structure Decision**: Vue component library under `vue/` with its own independent toolchain. Follows shadcn-vue conventions (components in `src/components/ui/`, custom components alongside). Tree view logic decomposed into composables to keep each SFC focused. React code at repo root remains untouched.

## Component Architecture

### Decomposition Strategy

The monolithic React component (1,048 lines) is decomposed into:

| File | Responsibility | Lines (est.) |
|------|---------------|-------------|
| `TreeView.vue` | Root component: search bar, selection bar, expand controls, provides state | ~200 |
| `TreeItem.vue` | Recursive item: renders node, context menu, hover card, checkbox | ~250 |
| `types.ts` | All exported TypeScript interfaces | ~30 |
| `keys.ts` | InjectionKey symbol exports | ~20 |
| `utils.ts` | Pure functions: buildItemMap, filterTree, getItemPath, getAllFolderIds | ~80 |
| `useTreeSelection.ts` | Selection state + handlers (single, multi, range) | ~80 |
| `useTreeSearch.ts` | Search query state + filtered data computation | ~60 |
| `useTreeCheckbox.ts` | Checkbox state computation (three-state cascade) | ~50 |
| `useTreeKeyboard.ts` | Roving tabindex + keyboard event handlers | ~80 |
| `useTreeDragSelect.ts` | Drag-select mouse event handlers | ~70 |

### Data Flow

```
TreeView.vue (provider)
  ├── Owns all state: expandedIds, selectedIds, searchQuery, focusedId
  ├── Creates composables: useTreeSelection, useTreeSearch, etc.
  ├── Provides state + handlers via inject keys
  └── Renders TreeItem.vue[] for root items

TreeItem.vue (consumer, recursive)
  ├── Injects shared state + handlers
  ├── Computes local derived state (isOpen, isSelected, checkState)
  ├── Handles user interactions → calls injected handlers
  ├── Wraps content in ContextMenu, HoverCard (from shadcn-vue)
  └── Renders TreeItem.vue[] for children (self-reference)
```

### Animation Mapping (React → Vue)

| React Pattern | Vue Equivalent |
|---------------|---------------|
| `<motion.div animate={{ rotate: 90 }}>` (chevron) | CSS `transition: transform 100ms` + `:class` binding |
| `<AnimatePresence><motion.div initial/animate/exit>` (children) | Reka UI `<CollapsibleContent>` with CSS height transition via `--reka-collapsible-content-height` |
| `<AnimatePresence mode="wait">` (search ↔ selection bar) | `<Transition mode="out-in">` with CSS opacity/transform |

## Complexity Tracking

> No violations — section not applicable.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
