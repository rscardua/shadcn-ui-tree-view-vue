# Implementation Plan: Drag and Drop de Nós na Tree View

**Branch**: `005-node-drag-drop` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-node-drag-drop/spec.md`

## Summary

Adicionar funcionalidade de drag and drop ao componente TreeView, permitindo reordenar nós no mesmo nível e mover nós entre níveis hierárquicos (reparenting). A implementação usará a HTML5 Drag and Drop API nativa do navegador, com um composable `useTreeDragDrop` para encapsular toda a lógica de arrasto, e estenderá o sistema de provide/inject existente para comunicar estado de drag para os TreeItems.

## Technical Context

**Language/Version**: TypeScript 6.0 (strict mode) + Vue 3.5+  
**Primary Dependencies**: Vue 3, Reka UI, @lucide/vue, @vueuse/core, Tailwind CSS v4  
**Storage**: N/A (in-memory reactive state)  
**Testing**: Manual verification via demo app (quality gate per constitution)  
**Target Platform**: Desktop browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Library (reusable Vue component)  
**Performance Goals**: <100ms visual feedback, smooth operation with 1000 visible nodes  
**Constraints**: Desktop-only (mouse), no touch support in this scope  
**Scale/Scope**: Single component feature addition to existing TreeView

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | PASS | Drag-drop delivered as composable + extension to existing SFCs; no global state dependency |
| II. Vue 3 Idioms | PASS | `<script setup lang="ts">`, Composition API, typed provide/inject with InjectionKey symbols |
| III. Accessibility | PASS | Keyboard reordering via Alt+Arrow keys, ARIA `aria-grabbed`/`aria-dropeffect` attributes |
| IV. Slot-Based Extensibility | PASS | Drag handle can be customized via scoped slot; drag preview customizable |
| V. Feature Parity | PASS | Extends beyond React version (new feature), no existing feature removed |

## Project Structure

### Documentation (this feature)

```text
specs/005-node-drag-drop/
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
│   └── tree-view/
│       ├── TreeView.vue           # Extended: new props, drag state, event emissions
│       ├── TreeItem.vue           # Extended: drag handlers, drop zones, visual indicators
│       ├── DropIndicator.vue      # NEW: visual drop position indicator component
│       ├── types.ts               # Extended: DragDropEvent, DropZone, per-node draggable/droppable
│       ├── keys.ts                # Extended: new injection keys for drag state
│       ├── utils.ts               # Extended: tree mutation helpers (moveNode, removeNode, insertNode)
│       └── composables/
│           └── useTreeDragDrop.ts # NEW: core drag-drop composable (state, handlers, validation)
├── lib/
│   └── demo-data.ts              # Extended: add draggable/droppable examples
└── App.vue                        # Extended: demo with drag-drop enabled
```

**Structure Decision**: Follows existing single-project pattern. New logic encapsulated in a composable (`useTreeDragDrop.ts`) per Constitution Principle I (Component-First) and II (shared logic in composables). A dedicated `DropIndicator.vue` component handles visual feedback as a self-contained SFC.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
