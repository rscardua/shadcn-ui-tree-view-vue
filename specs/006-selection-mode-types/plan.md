# Implementation Plan: Selection Mode Types

**Branch**: `006-selection-mode-types` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-selection-mode-types/spec.md`

## Summary

Replace the `recursiveSelect` boolean prop with a `mode` prop supporting four checkbox propagation strategies: `independent` (default, no propagation), `top-down` (parent → descendants), `bottom-up` (children → ancestors), and `recursive` (bidirectional). The component will own all propagation logic and emit per-node `check-change` events, simplifying consumer code.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Vue 3.5+, Reka UI, @lucide/vue, Tailwind CSS v4
**Storage**: N/A (in-memory reactive state)
**Testing**: Manual verification via demo app
**Target Platform**: Browser (modern evergreen browsers)
**Project Type**: UI component library
**Performance Goals**: Acceptable for trees up to ~1000 nodes
**Constraints**: Must follow Vue 3 Composition API idioms, WAI-ARIA treeview pattern
**Scale/Scope**: 6 files modified, no new files (beyond spec artifacts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | **PASS** | Mode prop is self-contained on TreeView; no global state needed. Propagation logic stays within the component. |
| II. Vue 3 Idioms | **PASS** | Uses `<script setup>`, typed `defineProps`, `ref`/`computed`, typed `InjectionKey`. No Options API. |
| III. Accessibility | **PASS** | `aria-checked="mixed"` already supported for indeterminate state. No ARIA changes needed. |
| IV. Slot-Based Extensibility | **PASS** | No slot changes. Mode is prop-based configuration as expected. |
| V. Feature Parity | **PASS** | `recursive` mode preserves existing `recursiveSelect: true` behavior. New modes extend capability. |

**Post-Phase 1 Re-check**: All gates still pass. The design adds a type (`SelectionMode`), replaces one injection key, and modifies `handleCheckChange` — all within existing architectural patterns.

## Project Structure

### Documentation (this feature)

```text
specs/006-selection-mode-types/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── component-api.md # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (files to modify)

```text
vue/src/components/tree-view/
├── types.ts             # Add SelectionMode type, update TreeViewProps
├── keys.ts              # Replace TREE_RECURSIVE_SELECT → TREE_CHECK_MODE
├── utils.ts             # Add getDescendants(), getAffectedAncestors() helpers
├── TreeView.vue         # Core: new prop, propagation logic in handleCheckChange
└── TreeItem.vue         # Inject TREE_CHECK_MODE, update checkState computed

vue/src/
└── App.vue              # Demo: mode selector UI, simplified handler
```

**Structure Decision**: No new files or directories needed. All changes are modifications to existing tree-view component files.

## Complexity Tracking

No constitution violations. Table not applicable.
