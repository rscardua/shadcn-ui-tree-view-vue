# Component API Contract: TreeView Drag and Drop

**Feature**: 005-node-drag-drop  
**Date**: 2026-04-08

## New Props (TreeView)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| enableDragDrop | boolean | `false` | Enables drag-and-drop reordering on the tree |

## Extended TreeViewItem Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| draggable | boolean | `true` (when DnD enabled) | Per-node override: can this node be dragged? |
| droppable | boolean | `true` (when DnD enabled) | Per-node override: can this node receive drops? |

## New Events

### `drop`

Emitted when a drag-drop operation is about to complete. Cancelable.

**Payload**: `TreeDragDropEvent`

```typescript
interface TreeDragDropEvent {
  items: TreeViewItem[]
  sourceParentId: string | null
  targetParentId: string | null
  targetId: string
  zone: 'before' | 'after' | 'inside'
  preventDefault: () => void
  defaultPrevented: boolean
}
```

**Usage**:

```vue
<TreeView
  :data="treeData"
  :enable-drag-drop="true"
  @drop="handleDrop"
/>
```

```typescript
function handleDrop(event: TreeDragDropEvent) {
  // Optionally prevent the move
  if (!canMove(event.items, event.targetId)) {
    event.preventDefault()
  }
}
```

## New Injection Keys

| Key | Type | Description |
|-----|------|-------------|
| TREE_ENABLE_DRAG_DROP | boolean | Whether drag-drop is enabled |
| TREE_DRAG_STATE | DragDropState | Reactive drag state (isDragging, draggedIds, dropTargetId, dropZone) |
| TREE_ON_DRAG_START | (item: TreeViewItem, event: DragEvent) => void | Handler for drag start |
| TREE_ON_DRAG_OVER | (item: TreeViewItem, event: DragEvent) => void | Handler for drag over |
| TREE_ON_DROP | (item: TreeViewItem, event: DragEvent) => void | Handler for drop |
| TREE_ON_DRAG_END | (event: DragEvent) => void | Handler for drag end |

## New Component: DropIndicator

Internal component (not exported) rendered by TreeItem.

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| zone | 'before' \| 'after' | Position of the indicator line |
| depth | number | Indentation level (for correct horizontal positioning) |

## Keyboard Bindings (when enableDragDrop is true)

| Key | Action |
|-----|--------|
| Alt + ArrowUp | Move focused node up within siblings |
| Alt + ArrowDown | Move focused node down within siblings |
| Alt + ArrowLeft | Promote: move node to parent's level (after parent) |
| Alt + ArrowRight | Demote: move node into previous sibling as last child |

## v-model Support

When using `v-model:data`, the tree data is automatically updated after a successful (non-prevented) drop operation:

```vue
<TreeView
  v-model:data="treeData"
  :enable-drag-drop="true"
/>
```
