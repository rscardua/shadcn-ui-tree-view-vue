# Data Model: Node Action Buttons

**Feature**: 003-node-action-buttons
**Date**: 2026-04-08

## Entities

### TreeViewNodeAction

Represents a single action button that can appear on a tree node.

| Field   | Type                              | Required | Description                                                    |
| ------- | --------------------------------- | -------- | -------------------------------------------------------------- |
| id      | string                            | Yes      | Unique identifier for the action (e.g., `"edit"`, `"open-map"`) |
| icon    | Component                         | Yes      | Vue component reference for the button icon (e.g., Lucide icon) |
| tooltip | string                            | Yes      | Text displayed in the tooltip on hover                         |
| action  | (item: TreeViewItem) => void      | No       | Optional callback invoked when the button is clicked           |

**Validation rules**:
- `id` must be unique within a single node type's action array.
- `icon` must be a valid Vue component (renderable via `<component :is>`).
- `tooltip` must be a non-empty string.

### TreeViewNodeActionsMap

Configuration object mapping node type strings to arrays of `TreeViewNodeAction`.

| Field   | Type                            | Description                                        |
| ------- | ------------------------------- | -------------------------------------------------- |
| [type]  | TreeViewNodeAction[]            | Array of actions available for nodes of this type   |

**Relationship**: The map keys correspond to the `type` field of `TreeViewItem`. A node with `type: "region"` will display the actions from `nodeActionsMap["region"]`.

**Validation rules**:
- Keys should match existing `TreeViewItem.type` values; unmatched keys are silently ignored.
- Empty arrays are valid and result in no action buttons for that type.

## Relationships

```text
TreeViewNodeActionsMap
  └── [type: string] ──> TreeViewNodeAction[]
                              │
                              ├── id
                              ├── icon (Component)
                              ├── tooltip
                              └── action? ──> receives TreeViewItem
```

## State Transitions

No state transitions — action buttons are stateless UI elements. Their visibility is determined by hover state (CSS-driven, not data-driven). The actions map is reactive: if the consumer updates it at runtime, the tree reflects the change immediately.

## Injection Flow

```text
TreeView.vue
  ├── provide(TREE_NODE_ACTIONS, props.nodeActions ?? {})
  └── provide(TREE_ON_NODE_ACTION, (actionId, item) => emit('node-action', actionId, item))

TreeItem.vue
  ├── inject(TREE_NODE_ACTIONS) → nodeActionsMap
  ├── inject(TREE_ON_NODE_ACTION) → onNodeAction
  └── computed: currentNodeActions = nodeActionsMap[item.type] ?? []
```
