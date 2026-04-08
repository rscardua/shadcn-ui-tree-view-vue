# Feature Specification: Selection Mode Types

**Feature Branch**: `006-selection-mode-types`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Alterar o options recursiveSelect para um option chamado mode com quatro tipos: não recursivo, recursivo de cima para baixo, recursivo de baixo para cima e recursivo geral."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Non-Recursive Checkbox Selection (Priority: P1)

A developer configures the tree-view component with `mode: 'independent'` (or omits `mode`, since independent is the default). When a user checks or unchecks a node, only that specific node changes state. No parent or child nodes are affected.

**Why this priority**: This is the current default behavior (previously `recursiveSelect: false`) and must be preserved as the baseline to avoid breaking existing consumers.

**Independent Test**: Can be fully tested by checking a parent node and verifying that its children remain unchecked, and vice-versa.

**Acceptance Scenarios**:

1. **Given** a tree with parent and child nodes and `mode` set to `'independent'`, **When** the user checks a parent node, **Then** only that parent node is checked; child nodes remain unchanged.
2. **Given** a tree with `mode` set to `'independent'`, **When** the user unchecks a child node, **Then** only that child node is unchecked; the parent node state remains unchanged.
3. **Given** a tree with no `mode` prop specified, **When** the user checks any node, **Then** behavior is identical to `mode: 'independent'` (default).

---

### User Story 2 - Top-Down Recursive Selection (Priority: P2)

A developer configures the tree-view with `mode: 'top-down'`. When a user checks a parent node, all its descendants are also checked. Unchecking a parent unchecks all descendants. However, checking or unchecking a child node does **not** propagate upward to the parent.

**Why this priority**: Top-down cascading is the most commonly requested recursive selection pattern (e.g., "select all files in a folder").

**Independent Test**: Can be fully tested by checking a parent folder and verifying all children become checked, then checking a single child and verifying the parent remains unaffected.

**Acceptance Scenarios**:

1. **Given** a tree with `mode: 'top-down'` and a parent node with three children, **When** the user checks the parent, **Then** the parent and all three children become checked.
2. **Given** a tree with `mode: 'top-down'` and a checked parent with all children checked, **When** the user unchecks the parent, **Then** the parent and all children become unchecked.
3. **Given** a tree with `mode: 'top-down'`, **When** the user checks a child node, **Then** only that child is checked; the parent state does not change.
4. **Given** a tree with `mode: 'top-down'` and deeply nested nodes (3+ levels), **When** the user checks a mid-level node, **Then** all descendants below that node are checked, but ancestors remain unchanged.

---

### User Story 3 - Bottom-Up Recursive Selection (Priority: P3)

A developer configures the tree-view with `mode: 'bottom-up'`. When a user checks a child node and all siblings become checked, the parent automatically becomes checked. When a user unchecks a child, the parent becomes unchecked (or indeterminate if other siblings remain checked). Checking a parent does **not** cascade down to children.

**Why this priority**: Bottom-up propagation is useful for aggregation scenarios (e.g., "all items reviewed means folder is reviewed") but is less commonly needed than top-down.

**Independent Test**: Can be fully tested by checking all children of a parent and verifying the parent auto-checks, then unchecking one child and verifying the parent reflects the partial state.

**Acceptance Scenarios**:

1. **Given** a tree with `mode: 'bottom-up'` and a parent with three unchecked children, **When** the user checks all three children, **Then** the parent automatically becomes checked.
2. **Given** a tree with `mode: 'bottom-up'` and a fully checked parent (all children checked), **When** the user unchecks one child, **Then** the parent reflects a partial/indeterminate state.
3. **Given** a tree with `mode: 'bottom-up'`, **When** the user checks a parent node, **Then** only the parent is checked; child nodes remain unchanged.
4. **Given** a tree with `mode: 'bottom-up'` and deeply nested nodes, **When** all leaf nodes under a subtree become checked, **Then** the check state propagates upward through all ancestors.

---

### User Story 4 - Bidirectional Recursive Selection (Priority: P4)

A developer configures the tree-view with `mode: 'recursive'`. This combines top-down and bottom-up behavior: checking a parent checks all descendants, and when all children become checked the parent auto-checks. This is the behavior previously provided by `recursiveSelect: true`.

**Why this priority**: This is the full recursive mode that existed before. It is the most complex mode and builds on stories 2 and 3.

**Independent Test**: Can be fully tested by checking a parent (verifying children cascade) and then unchecking a single child (verifying parent reflects partial state).

**Acceptance Scenarios**:

1. **Given** a tree with `mode: 'recursive'` and a parent with children, **When** the user checks the parent, **Then** all descendants are also checked (top-down cascade).
2. **Given** a tree with `mode: 'recursive'` and a fully checked parent, **When** the user unchecks one child, **Then** the parent reflects a partial/indeterminate state (bottom-up propagation).
3. **Given** a tree with `mode: 'recursive'` and all children of a parent checked individually, **When** the last unchecked sibling is checked, **Then** the parent automatically becomes checked.
4. **Given** a tree with `mode: 'recursive'` and deeply nested nodes, **When** the user checks a root-level parent, **Then** all nodes in the entire subtree become checked across all nesting levels.

---

### Edge Cases

- What happens when `mode` is set to an invalid value? The component should fall back to `'independent'` behavior.
- What happens when a node has no children and `mode` is `'top-down'` or `'bottom-up'`? Behavior is identical to `'independent'` since there is no hierarchy to propagate through.
- What happens when `mode` changes dynamically at runtime? The new mode should take effect immediately for subsequent interactions without altering existing check states.
- What happens with the indeterminate checkbox visual state? In `'bottom-up'` and `'recursive'` modes, a parent whose children are partially checked should display an indeterminate state. In `'independent'` and `'top-down'` modes, there is no indeterminate state since parents don't react to children.

## Clarifications

### Session 2026-04-08

- Q: How should `check-change` events be emitted during propagation (e.g., top-down cascade)? → A: Emit `check-change` for every affected node (one event per node that changes state).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The component MUST accept a `mode` prop that replaces the existing `recursiveSelect` boolean prop.
- **FR-002**: The `mode` prop MUST support four values: `'independent'`, `'top-down'`, `'bottom-up'`, and `'recursive'`.
- **FR-003**: When `mode` is `'independent'` (or not specified), checking a node MUST only affect that specific node.
- **FR-004**: When `mode` is `'top-down'`, checking or unchecking a parent MUST cascade the same action to all descendants.
- **FR-005**: When `mode` is `'top-down'`, checking or unchecking a child MUST NOT affect any ancestor nodes.
- **FR-006**: When `mode` is `'bottom-up'`, checking or unchecking a child MUST update ancestor states based on the combined state of all siblings.
- **FR-007**: When `mode` is `'bottom-up'`, checking or unchecking a parent MUST NOT cascade to descendant nodes.
- **FR-008**: When `mode` is `'recursive'`, the component MUST combine top-down and bottom-up behaviors (bidirectional propagation).
- **FR-009**: In modes that support upward propagation (`'bottom-up'` and `'recursive'`), parent nodes MUST display an indeterminate visual state when only some children are checked.
- **FR-010**: The `mode` prop MUST default to `'independent'` when not provided, preserving backward compatibility for consumers who did not use `recursiveSelect`.
- **FR-011**: The `recursiveSelect` prop MUST be removed and replaced entirely by the `mode` prop.
- **FR-012**: When a check action propagates to multiple nodes (e.g., top-down cascade or bottom-up rollup), the component MUST emit a separate `check-change` event for each affected node that changes state.

### Key Entities

- **SelectionMode**: A type representing the four possible selection modes (`'independent'` | `'top-down'` | `'bottom-up'` | `'recursive'`).
- **CheckState**: The visual state of a checkbox node — can be `checked`, `unchecked`, or `indeterminate`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four selection modes produce correct check behavior when tested against their respective acceptance scenarios (100% scenario pass rate).
- **SC-002**: Existing consumers using the default configuration (no `recursiveSelect` or `mode` prop) experience no change in behavior after the update.
- **SC-003**: Indeterminate visual state is correctly displayed in `'bottom-up'` and `'recursive'` modes when a parent has partially checked children.
- **SC-004**: Mode changes at runtime take effect on the next user interaction without requiring component re-mount.
- **SC-005**: Check state propagation works correctly at all nesting levels (tested with at least 4 levels of depth).

## Assumptions

- The `recursiveSelect` prop will be fully removed (not deprecated). Since this is a pre-1.0 component, backward compatibility via deprecation is not required.
- The indeterminate checkbox visual state (tri-state) is already supported or can be achieved with the current checkbox component.
- The `mode` prop only affects checkbox behavior, not the click-to-select (highlight) behavior which is controlled by `enableSelection`.
- Performance of recursive propagation is acceptable for typical tree sizes (up to ~1000 nodes). Optimization for very large trees is out of scope.
