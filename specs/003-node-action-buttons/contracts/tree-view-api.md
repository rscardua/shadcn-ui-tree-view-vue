# Contract: TreeView Component API — Node Actions Extension

**Feature**: 003-node-action-buttons
**Date**: 2026-04-08

## New Prop

```ts
interface TreeViewProps {
  // ... existing props ...
  
  /**
   * Map of node types to their available action buttons.
   * Keys correspond to TreeViewItem.type values.
   * Optional — when omitted, no action buttons are shown (backward compatible).
   */
  nodeActions?: TreeViewNodeActionsMap
}
```

## New Emit

```ts
interface TreeViewEmits {
  // ... existing emits ...
  
  /**
   * Emitted when any node action button is clicked.
   * Always emitted regardless of whether the action has a callback.
   * @param actionId - The `id` of the clicked TreeViewNodeAction
   * @param item - The TreeViewItem the action was performed on
   */
  'node-action': [actionId: string, item: TreeViewItem]
}
```

## New Types (exported from `types.ts`)

```ts
import type { Component } from 'vue'

export interface TreeViewNodeAction {
  id: string
  icon: Component
  tooltip: string
  action?: (item: TreeViewItem) => void
}

export type TreeViewNodeActionsMap = Record<string, TreeViewNodeAction[]>
```

## New Injection Keys (exported from `keys.ts`)

```ts
export const TREE_NODE_ACTIONS: InjectionKey<TreeViewNodeActionsMap>
export const TREE_ON_NODE_ACTION: InjectionKey<(actionId: string, item: TreeViewItem) => void>
```

## Usage Contract

```vue
<TreeView
  :data="treeData"
  :node-actions="nodeActions"
  @node-action="(actionId, item) => handleNodeAction(actionId, item)"
/>
```

### Behavioral Guarantees

1. **Backward compatible**: Omitting `:node-actions` produces identical behavior to current version.
2. **Click isolation**: Clicking an action button does not trigger node selection, expand/collapse, or any other tree interaction.
3. **Dual handler**: If `TreeViewNodeAction.action` is defined, it is called first. The `node-action` event is always emitted after, regardless of callback presence or success.
4. **Reactivity**: Changes to the `nodeActions` prop are reflected immediately without requiring a re-mount.
5. **Type safety**: The actions map is keyed by `string` matching `TreeViewItem.type`. Unmatched keys are silently ignored.
