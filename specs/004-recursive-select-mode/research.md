# Research: 004-recursive-select-mode

**Date**: 2026-04-08

## R1: Current Selection Architecture

**Decision**: Extend the existing `handleSelect()` function in `TreeView.vue` with recursive propagation logic, controlled by a new `recursiveSelect` prop.

**Rationale**: The current selection system uses a `selectedIds: Ref<Set<string>>` managed in `TreeView.vue` (line 45) and shared via `provide(TREE_SELECTED_IDS, selectedIds)` (line 373). All selection mutations flow through `handleSelect()` (lines 123-166). Adding recursive logic here keeps the single source of truth pattern intact and requires no structural changes to the provide/inject architecture.

**Alternatives considered**:
- Composable extraction: Moving selection logic to a `useTreeSelection` composable was considered but rejected for this feature since it would be a refactor beyond scope. The existing inline approach works and adding one prop + propagation helper is minimal.
- Event-based propagation (parent emits to children): Rejected because selection state is already centralized in the parent via `selectedIds` Set — distributing it would add complexity.

## R2: Recursive Propagation Strategy

**Decision**: Use utility functions `getAllDescendantIds(item, itemMap)` and `getAncestorChain(itemId, data)` for downward/upward propagation, added to `utils.ts`.

**Rationale**: The existing `buildItemMap()` already creates an O(1) lookup map. Getting all descendants requires tree traversal but only for the subtree of the clicked node. Ancestor chain computation is needed for indeterminate state bubbling. Both are pure functions that fit the existing utils pattern.

**Alternatives considered**:
- Pre-computing parent pointers in the item map: Would speed up ancestor lookups but requires modifying `TreeViewItem` type or maintaining a separate parent map. Over-engineering for typical tree sizes (< 1000 nodes).

## R3: Indeterminate State for Selection

**Decision**: Compute selection state (selected/unselected/indeterminate) using a function similar to the existing `getCheckState()` in `utils.ts` (line 117), but operating on `selectedIds` instead of the `checked` property.

**Rationale**: `getCheckState()` already implements the exact same logic pattern for checkboxes — counting checked children and determining indeterminate from partial counts. A parallel `getSelectionState()` function avoids coupling selection and checkbox systems while reusing the proven algorithm.

**Alternatives considered**:
- Reusing `getCheckState()` directly by mapping selectedIds to checked properties: Rejected because it would require mutating tree data or creating shadow copies, adding complexity.

## R4: Visual Indeterminate Indicator

**Decision**: Apply a distinct CSS class (e.g., `data-selection-state="indeterminate"`) to TreeItem nodes when in indeterminate state, styled via Tailwind to show a visual differentiation (e.g., subtle background or icon change).

**Rationale**: The existing selection highlight uses `bg-accent` class toggled by `isSelected` computed property in `TreeItem.vue`. Adding a third state (indeterminate) needs a distinct visual. Using a data attribute allows flexible Tailwind styling without conditional class logic explosion.

**Alternatives considered**:
- Checkbox-style indicator (dash icon): Could work but selection and checkboxes are separate systems — mixing visual metaphors may confuse users.

## R5: Interaction with Existing Selection Modes (Ctrl+Click, Shift+Click, Drag)

**Decision**: Recursive propagation applies to the final selection result of each interaction mode:
- **Single click**: Select clicked node + all descendants (replacing previous selection)
- **Ctrl+Click**: Toggle clicked node + all descendants in current selection
- **Shift+Click**: Range select all visible nodes between last and current, then for each selected node that has children, also add all descendants
- **Drag select**: Same as shift+click — expand selection to include descendants of selected parents

**Rationale**: This follows the principle of least surprise. The recursive prop modifies *what* gets selected, not *how* selection is triggered. Each selection mode determines the "intent set" then recursive propagation expands it.

**Alternatives considered**:
- Only apply recursion on single-click, keep Ctrl/Shift/Drag independent: Creates inconsistent behavior where the mode affects recursion — confusing for users.

## R6: ARIA Compliance for Selection States

**Decision**: Use `aria-selected="true"` for selected nodes, `aria-selected="false"` for unselected, and `aria-selected="mixed"` is not valid for treeitem — instead, parent nodes with partial selection will use `aria-selected="false"` with an additional visual-only indicator. The WAI-ARIA treeview pattern does not support `aria-selected="mixed"`.

**Rationale**: The WAI-ARIA spec for `role="treeitem"` only supports `aria-selected` as true/false. Indeterminate is a visual-only concept for selection (unlike `aria-checked` which supports "mixed"). This aligns with constitution principle III (Accessibility).

**Alternatives considered**:
- Using `aria-checked="mixed"` alongside `aria-selected`: Only appropriate when checkboxes are visible, not for selection-only mode.
