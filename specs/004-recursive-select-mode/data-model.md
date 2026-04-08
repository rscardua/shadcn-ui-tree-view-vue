# Data Model: 004-recursive-select-mode

**Date**: 2026-04-08

## Entities

### TreeViewItem (existing — no changes)

| Field    | Type              | Description                    |
|----------|-------------------|--------------------------------|
| id       | string            | Unique node identifier         |
| name     | string            | Display label                  |
| type     | string            | Node type (folder, file, etc.) |
| children | TreeViewItem[]?   | Optional nested children       |
| checked  | boolean?          | Checkbox state (separate system)|

No changes to the data model. Recursive selection operates on the existing `selectedIds: Set<string>` state, not on the item data structure.

### TreeViewProps (extended)

| Field           | Type    | Default | Description                                      |
|-----------------|---------|---------|--------------------------------------------------|
| recursiveSelect | boolean | false   | When true, selecting a parent selects all descendants |

New prop added to the existing `TreeViewProps` interface.

## State Model

### Selection State Machine (per node, when recursiveSelect=true)

```
                    ┌─────────────┐
        ┌──────────►│  Unselected  │◄──────────┐
        │           └──────┬──────┘            │
        │                  │                   │
  deselect parent    select child         deselect all
  (propagates down)  (partial)            children
        │                  │                   │
        │           ┌──────▼──────┐            │
        │           │Indeterminate│────────────┘
        │           └──────┬──────┘
        │                  │
        │           select parent or
        │           select remaining children
        │                  │
        │           ┌──────▼──────┐
        └───────────┤   Selected   │
                    └─────────────┘
```

### Selection State Computation

For a given node with children, the selection state is derived from `selectedIds`:

- **Selected**: Node ID is in `selectedIds` AND all descendant IDs are in `selectedIds`
- **Unselected**: Node ID is NOT in `selectedIds` AND no descendant IDs are in `selectedIds`
- **Indeterminate**: Some (but not all) nodes in the subtree are in `selectedIds`

Leaf nodes can only be Selected or Unselected (never Indeterminate).

## Provide/Inject Extensions

### New Injection Key

| Key                      | Type    | Description                           |
|--------------------------|---------|---------------------------------------|
| TREE_RECURSIVE_SELECT    | boolean | Whether recursive selection is active |

Provided by `TreeView.vue`, consumed by `TreeItem.vue` for visual state computation.

## Utility Functions (new)

### getAllDescendantIds(item: TreeViewItem): string[]
Returns flat array of all descendant node IDs (recursive).

### findAncestors(itemId: string, data: TreeViewItem[]): TreeViewItem[]
Returns array of ancestor items from root to direct parent.

### getSelectionState(item: TreeViewItem, selectedIds: Set<string>): 'selected' | 'unselected' | 'indeterminate'
Computes aggregate selection state for a node based on its subtree's presence in selectedIds.
