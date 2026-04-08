# Component API Contract: Selection Mode Types

**Branch**: `006-selection-mode-types` | **Date**: 2026-04-08

## TreeView Component Props

### Changed Props

```typescript
// REMOVED
// recursiveSelect?: boolean  // default: false

// ADDED
mode?: 'independent' | 'top-down' | 'bottom-up' | 'recursive'  // default: 'independent'
```

### Events (unchanged signature)

```typescript
'check-change': (item: TreeViewItem, checked: boolean) => void
```

**Behavioral change**: In modes other than `'independent'`, a single user checkbox click may trigger multiple `check-change` events (one per affected node). Events are emitted synchronously in a single microtask.

### Emission order by mode

- **independent**: 1 event (clicked node)
- **top-down**: 1 + N events (clicked node first, then descendants in tree order)
- **bottom-up**: 1 + M events (clicked node first, then affected ancestors bottom-to-top)
- **recursive**: 1 + N + M events (clicked node, descendants, then affected ancestors)

## Injection Keys

### Removed

```typescript
TREE_RECURSIVE_SELECT: InjectionKey<Ref<boolean>>
```

### Added

```typescript
TREE_CHECK_MODE: InjectionKey<Ref<SelectionMode>>
```

## Exported Types

### New

```typescript
export type SelectionMode = 'independent' | 'top-down' | 'bottom-up' | 'recursive'
```

### Modified

```typescript
export interface TreeViewProps {
  // ... existing props unchanged ...
  mode?: SelectionMode          // replaces recursiveSelect
  // recursiveSelect removed
}
```

## Consumer Migration

```diff
- <TreeView :recursive-select="true" @check-change="handleCheck" />
+ <TreeView mode="recursive" @check-change="handleCheck" />
```

**Consumer handler simplification**: With all modes, the consumer handler only needs to apply per-node updates. The cascading logic is handled internally by the component.

```typescript
// Before (consumer had to cascade)
function handleCheck(item, checked) {
  if (recursiveSelect) {
    updateItemAndAllDescendants(item, checked)
  } else {
    updateItem(item, checked)
  }
}

// After (consumer just updates the single reported node)
function handleCheck(item, checked) {
  updateItem(item, checked)  // called once per affected node by the component
}
```
