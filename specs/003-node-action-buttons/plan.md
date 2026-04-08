# Implementation Plan: Node Action Buttons

**Branch**: `003-node-action-buttons` | **Date**: 2026-04-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-node-action-buttons/spec.md`

## Summary

Add configurable floating action buttons per node type in the tree view. Action buttons appear on hover (right-aligned in the node row), show tooltips, and support both direct callbacks and emitted events. The implementation follows the existing `provide`/`inject` pattern with typed `InjectionKey` symbols and reuses the established `group-hover:opacity-0/100` CSS pattern already used by the info HoverCard buttons.

## Technical Context

**Language/Version**: TypeScript 5.x, Vue 3.5+ (Composition API, `<script setup>`)
**Primary Dependencies**: Reka UI (tooltip primitives), @lucide/vue (icons), Tailwind CSS v4
**Storage**: N/A
**Testing**: Manual verification via demo app (no automated test framework in project)
**Target Platform**: Web (modern desktop browsers)
**Project Type**: Component library with demo application
**Performance Goals**: Action buttons visible within 200ms of hover (CSS transition)
**Constraints**: Backward compatible — existing tree view behavior unchanged when no `nodeActions` prop provided
**Scale/Scope**: 4 source files modified, 5 new UI component files (tooltip), 1 demo update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle                          | Status  | Notes                                                                                                                                                                                                          |
| ---------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Component-First                 | ✅ Pass | Node actions configured via props, distributed via `provide`/`inject` with defaults. No global state.                                                                                                          |
| II. Vue 3 Idioms (NON-NEGOTIABLE)  | ✅ Pass | Will use `<script setup lang="ts">`, `defineProps<T>()`, `defineEmits<T>()`, typed `InjectionKey`, `computed`, `ref`.                                                                                          |
| III. Accessibility (NON-NEGOTIABLE) | ✅ Pass | Action buttons are native `<button>` elements with tooltip text as `aria-label`. Buttons are focusable and activatable via keyboard (Enter/Space). They live inside the treeitem row and inherit focus context. |
| IV. Slot-Based Extensibility       | ✅ Pass | Prop-based configuration is the primary path (action map). Slot-based override is not required for v1 — the design doc specifies icon components as props, consistent with the existing `iconMap` pattern.      |
| V. Feature Parity                  | N/A     | This is a new feature not present in the original React implementation. No parity requirement applies.                                                                                                         |

**GATE RESULT: PASS** — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-node-action-buttons/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
vue/src/
├── components/
│   ├── tree-view/
│   │   ├── TreeView.vue      # Modified: new prop, provide, emit
│   │   ├── TreeItem.vue       # Modified: inject, computed, handler, template
│   │   ├── keys.ts            # Modified: 2 new injection keys
│   │   ├── types.ts           # Modified: 2 new interfaces
│   │   ├── utils.ts           # Unchanged
│   │   └── composables/       # Unchanged
│   └── ui/
│       └── tooltip/           # NEW: 5 files (shadcn/Reka UI tooltip components)
│           ├── Tooltip.vue
│           ├── TooltipProvider.vue
│           ├── TooltipTrigger.vue
│           ├── TooltipContent.vue
│           └── index.ts
├── App.vue                    # Modified: add nodeActions demo config and handler
└── lib/
    └── demo-data.ts           # Unchanged
```

**Structure Decision**: Single existing project structure under `vue/src/`. New tooltip components follow the established shadcn/ui pattern in `components/ui/`. All tree-view changes are in existing files — no new tree-view files needed.
