# Data Model: Drag and Drop de Nós na Tree View

**Feature**: 005-node-drag-drop  
**Date**: 2026-04-08

## Extended Entities

### TreeViewItem (extended)

Existing interface with new optional fields for per-node drag control.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique identifier (existing) |
| name | string | yes | Display name (existing) |
| type | string | yes | Node type e.g. "folder", "file" (existing) |
| children | TreeViewItem[] | no | Nested children (existing) |
| checked | boolean | no | Checkbox state (existing) |
| **draggable** | boolean | no | Whether this node can be dragged. Defaults to `true` when drag-drop is enabled globally |
| **droppable** | boolean | no | Whether this node can receive drops (as parent). Defaults to `true` when drag-drop is enabled globally |

### DropZone (new enum)

Represents where a dragged item will be placed relative to a drop target.

| Value | Description |
|-------|-------------|
| `before` | Insert before the target node (same level) |
| `after` | Insert after the target node (same level) |
| `inside` | Insert as last child of the target node (reparenting) |

### DragDropState (new — composable internal state)

Reactive state managed by `useTreeDragDrop` composable.

| Field | Type | Description |
|-------|------|-------------|
| isDragging | Ref\<boolean\> | Whether a drag operation is in progress |
| draggedIds | Ref\<Set\<string\>\> | IDs of nodes being dragged |
| dropTargetId | Ref\<string \| null\> | ID of the current drop target node |
| dropZone | Ref\<DropZone \| null\> | Current drop zone (before/after/inside) |

### TreeDragDropEvent (new — emitted event payload)

Payload emitted via the `drop` event when a drag-drop operation completes.

| Field | Type | Description |
|-------|------|-------------|
| items | TreeViewItem[] | The node(s) being moved |
| sourceParentId | string \| null | Parent ID of the source location (null if root) |
| targetParentId | string \| null | Parent ID of the destination (null if root) |
| targetId | string | ID of the node used as drop reference |
| zone | DropZone | Where relative to target: before, after, inside |
| preventDefault | () => void | Call to cancel the move operation |
| defaultPrevented | boolean | Whether preventDefault was called |

## State Transitions

### Drag Lifecycle

```
IDLE → DRAGGING → OVER_TARGET → DROPPED → IDLE
                                    ↓
                              (if prevented)
                                    ↓
                               CANCELLED → IDLE
```

| Transition | Trigger | Side Effects |
|-----------|---------|-------------|
| IDLE → DRAGGING | `dragstart` on a draggable node | Set `isDragging`, `draggedIds`; apply drag ghost styling |
| DRAGGING → OVER_TARGET | `dragover` on a valid target | Set `dropTargetId`, compute `dropZone` from cursor Y position |
| OVER_TARGET → OVER_TARGET | `dragover` on different target | Update `dropTargetId` and `dropZone` |
| OVER_TARGET → DRAGGING | `dragleave` without entering new target | Clear `dropTargetId` and `dropZone` |
| OVER_TARGET → DROPPED | `drop` on valid target | Emit `drop` event; if not prevented, execute tree mutation |
| DROPPED → IDLE | After mutation or prevention | Reset all drag state |
| DRAGGING → CANCELLED | `dragend` without valid drop | Reset all drag state |

### Validation Rules

| Rule | Check | On Failure |
|------|-------|-----------|
| No self-drop | `draggedIds.has(dropTargetId)` | Ignore drop, show "not-allowed" cursor |
| No circular drop | `getAllDescendantIds(draggedNode).has(dropTargetId)` | Ignore drop, show "not-allowed" cursor |
| Node is draggable | `item.draggable !== false` when DnD enabled | Don't set `draggable` attribute on DOM element |
| Node is droppable | `targetItem.droppable !== false` when DnD enabled | Ignore dragover/drop events |
| Consumer approval | `!event.defaultPrevented` after emit | Cancel mutation, reset state |

## Tree Mutation Operations

### moveNode(tree, nodeId, targetId, zone)

1. Find and remove node from current position in tree
2. Find target node's parent array
3. Based on zone:
   - `before`: Insert at target's index in parent array
   - `after`: Insert at target's index + 1 in parent array
   - `inside`: Push to target's `children` array (create if empty)
4. Return mutated tree (in-place)

### moveMultipleNodes(tree, nodeIds, targetId, zone)

1. Filter nodeIds: remove any node whose ancestor is also in the set
2. Sort remaining nodes by their current order in the tree
3. Remove all nodes from tree
4. Insert nodes at target position maintaining relative order
5. Return mutated tree (in-place)
