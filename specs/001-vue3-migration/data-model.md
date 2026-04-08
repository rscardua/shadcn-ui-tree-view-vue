# Data Model: Vue 3 Tree View Migration

**Branch**: `001-vue3-migration` | **Date**: 2026-04-08

## Core Entities

### TreeViewItem

Represents a node in the tree hierarchy. Recursive structure supporting unlimited nesting.

| Field    | Type               | Required | Description                                    |
|----------|--------------------|----------|------------------------------------------------|
| id       | string             | yes      | Unique identifier for the node                 |
| name     | string             | yes      | Display name shown in the tree                 |
| type     | string             | yes      | Item type, used for icon mapping lookup        |
| children | TreeViewItem[]     | no       | Child nodes (presence indicates folder)        |
| checked  | boolean            | no       | Checkbox state for access rights mode          |

**Identity rule**: `id` MUST be unique across the entire tree.
**Folder detection**: An item is a "folder" if `children` is defined (even if empty array).

### TreeViewMenuItem

Represents a configurable action in the context menu.

| Field  | Type                              | Required | Description                          |
|--------|-----------------------------------|----------|--------------------------------------|
| id     | string                            | yes      | Unique action identifier             |
| label  | string                            | yes      | Display text in the context menu     |
| icon   | Component                         | no       | Vue component for menu item icon     |
| action | (items: TreeViewItem[]) => void   | yes      | Callback receiving affected items    |

### TreeViewIconMap

Maps item type strings to Vue components for icon rendering.

```typescript
type TreeViewIconMap = Record<string, Component | undefined>
```

**Resolution order**: `getIcon` slot > `iconMap[item.type]` > `iconMap.folder` > default folder icon.

## Internal State (Component-Scoped)

These are not data model entities but reactive state managed by composables:

| State             | Type                | Scope          | Description                                          |
|-------------------|---------------------|----------------|------------------------------------------------------|
| expandedIds       | Set\<string\>       | TreeView       | IDs of currently expanded folders                    |
| selectedIds       | Set\<string\>       | TreeView       | IDs of currently selected items                      |
| searchQuery       | string              | TreeView       | Current search filter text                           |
| focusedId         | string \| null      | TreeView       | ID of item with keyboard focus (roving tabindex)     |
| isDragging        | boolean             | TreeView       | Whether drag-select is active                        |
| dragStartY        | number \| null      | TreeView       | Y coordinate where drag began                       |
| currentMouseY     | number              | TreeView       | Current Y coordinate during drag                    |
| itemMap           | Map\<string, item\> | TreeView       | Pre-built flat map for O(1) lookups (computed)       |

## Computed Derivations

| Derivation               | Input                     | Output               | Description                                   |
|--------------------------|---------------------------|-----------------------|-----------------------------------------------|
| filteredData             | data + searchQuery        | TreeViewItem[]        | Tree filtered by search, preserving hierarchy |
| searchExpandedIds        | filteredData              | Set\<string\>         | IDs to auto-expand when search is active      |
| checkState(item)         | item + children recursion | checked/unchecked/indeterminate | Three-state checkbox from children |
| selectedChildrenCount    | item + selectedIds        | number                | Count of selected descendants (for badges)    |
| itemPath(item)           | item + data recursion     | string                | Breadcrumb path for hover card display        |
| visibleItems             | data + expandedIds        | TreeViewItem[]        | Flat ordered list of visible items (for keyboard nav) |

## Provide/Inject Keys

Typed injection keys shared between TreeView (provider) and TreeItem (consumer):

| Key                  | Type                                                    | Description                        |
|----------------------|---------------------------------------------------------|------------------------------------|
| TREE_SELECTED_IDS    | Ref\<Set\<string\>\>                                    | Reactive selected item IDs         |
| TREE_EXPANDED_IDS    | Ref\<Set\<string\>\>                                    | Reactive expanded folder IDs       |
| TREE_FOCUSED_ID      | Ref\<string \| null\>                                   | Reactive focused item ID           |
| TREE_ITEM_MAP        | ComputedRef\<Map\<string, TreeViewItem\>\>              | Flat item lookup map               |
| TREE_ON_SELECT       | (item, event) => void                                   | Selection handler                  |
| TREE_ON_TOGGLE       | (id, isOpen) => void                                    | Expand/collapse handler            |
| TREE_ON_CHECK        | (item, checked) => void                                 | Checkbox change handler            |
| TREE_SHOW_CHECKBOXES | boolean                                                 | Whether checkboxes are enabled     |
| TREE_ICON_MAP        | TreeViewIconMap                                         | Icon type mapping                  |
| TREE_MENU_ITEMS      | TreeViewMenuItem[]                                      | Context menu configuration         |

## State Transitions

### Checkbox Cascade

```
User checks parent
  → All descendants set to checked=true
  → onCheckChange emitted for parent

User unchecks parent
  → All descendants set to checked=false
  → onCheckChange emitted for parent

User checks last unchecked child
  → Parent state transitions: indeterminate → checked

User unchecks one child of fully-checked parent
  → Parent state transitions: checked → indeterminate
```

### Selection Modes

```
Single click:      selectedIds = {clicked.id}
Ctrl+click:        selectedIds.toggle(clicked.id)
Shift+click:       selectedIds = range(lastSelected, clicked)
Drag-select:       selectedIds = items intersecting drag rect
```

### Search Lifecycle

```
User types query
  → filteredData recomputed (preserving ancestor paths)
  → searchExpandedIds merged into expandedIds
  → Tree re-renders with filtered items

User clears query
  → filteredData = original data
  → expandedIds reverts to pre-search state
```
