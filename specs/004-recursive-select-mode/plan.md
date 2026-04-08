# Implementation Plan: Recursive Select Mode

**Branch**: `004-recursive-select-mode` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-recursive-select-mode/spec.md`

## Summary

Add a `recursiveSelect` boolean prop to the TreeView component that controls whether selecting a parent node automatically selects/deselects all its descendants. When disabled (default), selection remains independent per node — preserving backward compatibility. When enabled, the component propagates selection down through all nesting levels, computes indeterminate states for partially-selected parents, and emits a single `selection-change` event with the full selection set.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: Vue 3.5+ (Composition API, `<script setup>`), Reka UI, @lucide/vue, Tailwind CSS v4  
**Storage**: N/A (in-memory reactive state)  
**Testing**: Manual verification in demo app + `pnpm type-check`  
**Target Platform**: Modern browsers (web)  
**Project Type**: UI component library  
**Performance Goals**: Smooth selection for trees up to ~1000 nodes  
**Constraints**: Must maintain backward compatibility with existing API; no new dependencies  
**Scale/Scope**: Single component enhancement across 6 files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | PASS | Feature adds a single prop to an existing self-contained SFC. New logic stays within the component, shared via provide/inject. No global state. |
| II. Vue 3 Idioms | PASS | Will use `<script setup lang="ts">`, type-based `defineProps`, `ref`/`computed`, typed `InjectionKey`. No Options API. |
| III. Accessibility | PASS | `aria-selected` will be managed correctly. Indeterminate is visual-only (WAI-ARIA treeitem doesn't support `aria-selected="mixed"`). Keyboard selection (Enter) will respect recursive propagation. |
| IV. Slot-Based Extensibility | PASS | No slot changes needed. Existing slots continue to work. |
| V. Feature Parity | PASS | Adds new capability beyond React version (enhancement, not regression). |

### Post-Phase 1 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | PASS | New utility functions are pure, new injection key follows existing pattern. |
| II. Vue 3 Idioms | PASS | `getSelectionState` used via `computed` in TreeItem. Prop provided via typed `InjectionKey<boolean>`. |
| III. Accessibility | PASS | Research R6 confirms `aria-selected` true/false only; indeterminate is visual indicator only. Keyboard nav (Enter/Space) respects recursive mode. |
| IV. Slot-Based Extensibility | PASS | No changes to slot system. |
| V. Feature Parity | PASS | Enhancement extending beyond original feature set. |

## Project Structure

### Documentation (this feature)

```text
specs/004-recursive-select-mode/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/           # Phase 1 API contracts
│   └── component-api.md # Component props/events/inject contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
vue/src/components/tree-view/
├── TreeView.vue         # MODIFY: add recursiveSelect prop, modify handleSelect, provide key
├── TreeItem.vue         # MODIFY: consume TREE_RECURSIVE_SELECT, add indeterminate visual state
├── types.ts             # MODIFY: add recursiveSelect to TreeViewProps
├── keys.ts              # MODIFY: add TREE_RECURSIVE_SELECT injection key
├── utils.ts             # MODIFY: add getAllDescendantIds, findAncestors, getSelectionState
└── composables/         # (empty — no changes needed)

vue/src/
└── App.vue              # MODIFY: add demo toggle for recursive-select
```

**Structure Decision**: All changes fit within the existing `tree-view/` component directory. No new files needed — only modifications to 6 existing files.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.

## Phase 1 Design Decisions

### Recursive Propagation Algorithm

**On select (click/enter on a node):**
1. Collect all descendant IDs of the clicked node using `getAllDescendantIds()`
2. Add clicked node ID + all descendant IDs to `selectedIds` Set
3. (Single event emitted by existing watcher on `selectedIds`)

**On deselect (click already-selected node):**
1. Collect all descendant IDs of the clicked node
2. Remove clicked node ID + all descendant IDs from `selectedIds` Set

**On Ctrl+Click (toggle in multi-select):**
1. If node is being added: add node + all descendants
2. If node is being removed: remove node + all descendants

**On Shift+Click (range select):**
1. Compute range of visible items as currently done
2. For each item in range that has children, also add all descendants

**Indeterminate computation:**
- `getSelectionState(item, selectedIds)` returns 'selected' | 'unselected' | 'indeterminate'
- Computed in `TreeItem.vue` for each node that has children
- Used purely for visual styling (data attribute or CSS class)
- Does NOT affect `selectedIds` — indeterminate is a derived display state

### Files Changed (detailed)

1. **types.ts**: Add `recursiveSelect?: boolean` to `TreeViewProps` interface
2. **keys.ts**: Add `TREE_RECURSIVE_SELECT` as `InjectionKey<boolean>`
3. **utils.ts**: Add 3 new exported functions:
   - `getAllDescendantIds(item: TreeViewItem): string[]`
   - `findAncestors(itemId: string, data: TreeViewItem[]): TreeViewItem[]`
   - `getSelectionState(item: TreeViewItem, selectedIds: Set<string>): 'selected' | 'unselected' | 'indeterminate'`
4. **TreeView.vue**:
   - Add `recursiveSelect` to props (default `false`)
   - `provide(TREE_RECURSIVE_SELECT, props.recursiveSelect)`
   - Modify `handleSelect()` to call propagation helpers when `props.recursiveSelect` is true
   - Ensure drag-select and shift-click also propagate
5. **TreeItem.vue**:
   - `inject(TREE_RECURSIVE_SELECT)` with default `false`
   - Compute `selectionState` when recursive mode is on and item has children
   - Apply `data-selection-state="indeterminate"` attribute for styling
   - Add Tailwind styles for indeterminate visual indicator
6. **App.vue**: Add a toggle switch/checkbox to enable `recursive-select` in the demo
