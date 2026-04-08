# Data Model: Selection Mode Types

**Branch**: `006-selection-mode-types` | **Date**: 2026-04-08

## Entities

### SelectionMode (new type)

A string union type representing the four checkbox propagation modes.

| Value | Description |
|-------|-------------|
| `'independent'` | No propagation. Each node checked independently. Default. |
| `'top-down'` | Checking parent cascades to all descendants. Children don't affect parents. |
| `'bottom-up'` | Children's state rolls up to ancestors. Parents don't cascade down. |
| `'recursive'` | Bidirectional: top-down cascade + bottom-up rollup. |

### CheckState (existing, unchanged)

| Value | Description |
|-------|-------------|
| `'checked'` | Node is fully checked |
| `'unchecked'` | Node is not checked |
| `'indeterminate'` | Some (not all) children are checked. Only visible in `bottom-up` and `recursive` modes. |

### TreeViewItem (existing, unchanged)

No changes to the data model. The `checked?: boolean` property on `TreeViewItem` remains the source of truth for each node's check state. The `mode` prop only controls how user interactions propagate across nodes.

### TreeViewProps (modified)

| Property | Change | Old | New |
|----------|--------|-----|-----|
| `recursiveSelect` | **Removed** | `boolean` (default `false`) | — |
| `mode` | **Added** | — | `SelectionMode` (default `'independent'`) |

## State Transitions

### Independent Mode
```
User checks node X → X.checked = true (no other nodes affected)
User unchecks node X → X.checked = false (no other nodes affected)
```

### Top-Down Mode
```
User checks parent P → P.checked = true, all descendants.checked = true
User unchecks parent P → P.checked = false, all descendants.checked = false
User checks leaf L → L.checked = true (no ancestors affected)
```

### Bottom-Up Mode
```
User checks child C → C.checked = true
  → If all siblings of C are now checked → parent.checked = true
  → Repeat upward for each ancestor
User unchecks child C → C.checked = false
  → parent visual state becomes indeterminate (if other siblings remain checked)
  → parent.checked = false (emitted if parent was previously checked)
User checks parent P → P.checked = true (no descendants affected)
```

### Recursive Mode
```
User checks parent P → P.checked = true, all descendants.checked = true
  → Bottom-up: ancestors updated if all siblings now checked
User unchecks child C → C.checked = false
  → Top-down: no cascade (only unchecking a parent cascades down)
  → Bottom-up: parent visual state becomes indeterminate
```

## Relationships

```
TreeView (owns mode prop)
  └─ provides TREE_CHECK_MODE → TreeItem (reads for visual state computation)
  └─ handleCheckChange (uses mode + itemMap to compute propagation)
       └─ emits check-change(node, checked) per affected node
```
