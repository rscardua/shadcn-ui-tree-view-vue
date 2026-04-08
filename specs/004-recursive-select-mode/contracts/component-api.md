# Component API Contract: Recursive Select Mode

**Date**: 2026-04-08

## Props (additions to TreeViewProps)

```typescript
interface TreeViewProps {
  // ... existing props unchanged ...

  /**
   * When true, selecting a parent node automatically selects/deselects
   * all its descendants. When false (default), selection is independent.
   */
  recursiveSelect?: boolean  // default: false
}
```

## Events (unchanged behavior, refined semantics)

```typescript
// Existing event — no signature change
'selection-change': (items: TreeViewItem[]) => void
```

**Behavioral change when `recursiveSelect=true`**:
- The `items` array in `selection-change` contains ALL currently selected items (the full set), not just the newly added/removed ones.
- A single user click on a parent may cause the set to grow by N+1 items, but only ONE `selection-change` event is emitted.

## Provide/Inject (additions)

```typescript
// New injection key in keys.ts
export const TREE_RECURSIVE_SELECT: InjectionKey<boolean> = Symbol('tree-recursive-select')
```

## Visual States (TreeItem)

When `recursiveSelect=true`, each tree item node can be in one of three visual states:

| State         | Condition                                    | Visual                          |
|---------------|----------------------------------------------|---------------------------------|
| selected      | Node and all descendants in selectedIds      | `bg-accent` (existing)          |
| unselected    | Node and no descendants in selectedIds       | No highlight (existing)         |
| indeterminate | Some but not all subtree nodes in selectedIds| Subtle distinct indicator       |

## Usage Example

```vue
<!-- Independent selection (default, backward compatible) -->
<TreeView :data="treeData" />

<!-- Recursive selection enabled -->
<TreeView :data="treeData" :recursive-select="true" />
```
