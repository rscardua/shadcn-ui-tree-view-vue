# Component API Contract: TreeView

**Branch**: `001-vue3-migration` | **Date**: 2026-04-08

## TreeView Component

### Props

```typescript
interface TreeViewProps {
  /** Tree data array with nested children */
  data: TreeViewItem[]
  /** Optional title (reserved for future use) */
  title?: string
  /** Show expand all / collapse all buttons. Default: false */
  showExpandAll?: boolean
  /** Show access rights checkboxes. Default: false */
  showCheckboxes?: boolean
  /** Placeholder text for search input. Default: "Search..." */
  searchPlaceholder?: string
  /** Label for selection count display. Default: "selected" */
  selectionText?: string
  /** Custom labels for checkbox actions */
  checkboxLabels?: { check: string; uncheck: string }
  /** Icon map: item type → Vue component */
  iconMap?: TreeViewIconMap
  /** Context menu action items */
  menuItems?: TreeViewMenuItem[]
}
```

### Emits

```typescript
interface TreeViewEmits {
  /** Fired when selection changes. Payload: array of selected items */
  (e: 'selection-change', items: TreeViewItem[]): void
  /** Fired when a checkbox state changes. Payload: item + new checked state */
  (e: 'check-change', item: TreeViewItem, checked: boolean): void
  /** Fired when a context menu action is triggered. Payload: action ID + affected items */
  (e: 'action', action: string, items: TreeViewItem[]): void
}
```

### Slots

```typescript
interface TreeViewSlots {
  /** Custom icon rendering per item */
  icon: (props: { item: TreeViewItem; depth: number }) => any
  /** Custom item label rendering */
  label: (props: { item: TreeViewItem }) => any
}
```

### Usage Example

```vue
<template>
  <TreeView
    :data="treeData"
    :show-checkboxes="true"
    :show-expand-all="true"
    :icon-map="iconMap"
    :menu-items="menuItems"
    search-placeholder="Search items..."
    @selection-change="onSelectionChange"
    @check-change="onCheckChange"
    @action="onAction"
  >
    <template #icon="{ item, depth }">
      <component :is="getIconForItem(item, depth)" />
    </template>
  </TreeView>
</template>
```

## TreeViewItem Interface

```typescript
export interface TreeViewItem {
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
}
```

## TreeViewMenuItem Interface

```typescript
export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: Component
  action: (items: TreeViewItem[]) => void
}
```

## TreeViewIconMap Type

```typescript
export type TreeViewIconMap = Record<string, Component | undefined>
```

## Keyboard Interactions (WAI-ARIA Treeview)

| Key          | Action                                          |
|--------------|-------------------------------------------------|
| Arrow Down   | Move focus to next visible item                 |
| Arrow Up     | Move focus to previous visible item             |
| Arrow Right  | Expand focused folder / move to first child     |
| Arrow Left   | Collapse focused folder / move to parent        |
| Enter        | Select/activate focused item                    |
| Space        | Toggle checkbox (if checkboxes enabled)         |
| Home         | Move focus to first visible item                |
| End          | Move focus to last visible item                 |

## ARIA Attributes

| Element        | Attributes                                                    |
|----------------|---------------------------------------------------------------|
| Tree container | `role="tree"`, `aria-label`                                   |
| Tree item      | `role="treeitem"`, `aria-selected`, `tabindex="0"/"-1"`       |
| Folder item    | `role="treeitem"`, `aria-expanded="true"/"false"`             |
| Checkbox item  | `aria-checked="true"/"false"/"mixed"`                         |
| Child group    | `role="group"`                                                |
