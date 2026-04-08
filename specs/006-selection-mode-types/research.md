# Research: Selection Mode Types

**Branch**: `006-selection-mode-types` | **Date**: 2026-04-08

## Decision 1: Where to place cascading logic

**Decision**: Move cascading logic into TreeView.vue's `handleCheckChange`, not in TreeItem or a composable.

**Rationale**: Currently, the cascading logic lives in App.vue (the consumer). Per FR-012, the component must emit `check-change` per affected node. TreeView.vue already has access to `itemMap` (full tree state) and is the single entry point for all check events via `provide(TREE_ON_CHECK)`. Placing the logic here means:
- TreeItem remains a pure presentation component (no mode awareness needed for event emission)
- The consumer receives granular events and applies simple per-node updates
- TreeView.vue has all the context needed (mode prop, itemMap, tree data) to compute propagation

**Alternatives considered**:
- **Composable (`useCheckMode`)**: Would add indirection; the logic is tightly coupled to TreeView's provided state, so extraction gains little.
- **Keep in consumer (App.vue)**: Violates FR-012 — the component must own propagation logic so all consumers get consistent behavior.

## Decision 2: How TreeItem computes visual check state

**Decision**: TreeItem's `checkState` computed property will branch on the injected mode value instead of a boolean.

**Rationale**: Currently TreeItem checks `recursiveSelectRef.value` to decide between `getCheckState()` (recursive tri-state) and direct `item.checked` (binary). The new logic:
- `'independent'` / `'top-down'`: Use direct `item.checked` (no indeterminate — parents don't react to children)
- `'recursive'`: Use `getCheckState()` which computes the tri-state from descendants
- `'bottom-up'`: Use a mode-aware helper that treats a directly checked folder as checked for its own ancestors, even when its descendants stay unchanged

**Alternatives considered**:
- **Reuse `getCheckState()` for bottom-up**: Rejected because it ignores a folder's own `checked` flag once that folder has children, so directly checked mid-level nodes do not contribute to ancestor state.

## Decision 3: Bottom-up ancestor state computation

**Decision**: When emitting bottom-up propagation events, compute projected ancestor states by walking up the tree and checking if all siblings (including the just-changed node) would be checked. A directly checked intermediate node counts as a checked sibling even if its descendants remain unchanged.

**Rationale**: The component reads current state from `itemMap` and projects forward. For example, if a child is being checked and all its siblings are already checked, the parent should also be emitted as checked. This avoids timing issues since all events are computed synchronously before any consumer processing occurs.

**Alternatives considered**:
- **Let consumer handle bottom-up**: Violates FR-012 and makes consumer logic complex.
- **Internal state management**: Would break the current external-state pattern and is a larger refactor than needed.

## Decision 4: Injection key type change

**Decision**: Replace `TREE_RECURSIVE_SELECT` (boolean) with `TREE_CHECK_MODE` injection key carrying the `SelectionMode` type.

**Rationale**: Direct replacement. The boolean was only used in TreeItem's computed property. The new string union type provides the same branching capability with finer granularity.

**Alternatives considered**:
- **Keep boolean + add separate key**: Unnecessary complexity; clean replacement is simpler.

## Decision 5: Leaf node checkbox rendering

**Decision**: Update leaf node checkbox in TreeItem to use `checkState` computed instead of direct `item.checked`, making rendering consistent across folder and leaf nodes.

**Rationale**: Currently leaf nodes render `v-if="item.checked"` directly while folders use `checkState`. With the new modes, a leaf node's visual state is always binary (checked/unchecked) since leaves have no children. However, using the same `checkState` computed for both simplifies the template and makes future changes easier. The `getCheckState` function already returns binary for leaf nodes.

**Alternatives considered**:
- **Keep separate rendering**: Works but creates inconsistency in the template.
