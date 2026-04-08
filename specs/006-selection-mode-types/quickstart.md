# Quickstart: Selection Mode Types

**Branch**: `006-selection-mode-types` | **Date**: 2026-04-08

## Files to Modify

| File | Change |
|------|--------|
| `vue/src/components/tree-view/types.ts` | Add `SelectionMode` type, replace `recursiveSelect` with `mode` in `TreeViewProps` |
| `vue/src/components/tree-view/keys.ts` | Replace `TREE_RECURSIVE_SELECT` with `TREE_CHECK_MODE` |
| `vue/src/components/tree-view/utils.ts` | Add helper functions for propagation: `getDescendants`, `getAffectedAncestors` |
| `vue/src/components/tree-view/TreeView.vue` | Replace `recursiveSelect` prop/provide with `mode`, update `handleCheckChange` with propagation logic |
| `vue/src/components/tree-view/TreeItem.vue` | Replace `TREE_RECURSIVE_SELECT` injection with `TREE_CHECK_MODE`, update `checkState` computed |
| `vue/src/App.vue` | Update demo: replace `recursiveSelect` toggle with mode selector, simplify `handleCheckChange` |

## Implementation Order

1. **types.ts** — Add `SelectionMode` type, update `TreeViewProps`
2. **keys.ts** — Replace injection key
3. **utils.ts** — Add propagation helpers
4. **TreeView.vue** — Wire up new prop, provide mode, implement propagation in `handleCheckChange`
5. **TreeItem.vue** — Inject new key, update `checkState` computed
6. **App.vue** — Update demo UI and handler

## Key Implementation Notes

- `getCheckState()` remains the recursive aggregation helper; bottom-up needs a mode-aware helper so a directly checked intermediate node still counts as checked for its ancestors
- TreeItem leaf checkbox rendering should switch from `item.checked` to `checkState` computed for consistency
- The `handleCheckChange` in TreeView.vue is the core change: it must compute all affected nodes and emit per-node events
- App.vue's `handleCheckChange` becomes simpler: just update the single reported node (no cascading logic needed)

## Verification

After implementation, verify each mode with the demo app:
1. `independent`: check parent → only parent changes
2. `top-down`: check parent → parent + all descendants change
3. `bottom-up`: check all children → parent auto-checks; uncheck one child → parent becomes indeterminate; check a mid-level node directly → descendants stay unchanged and ancestors react to that node's checked state
4. `recursive`: check parent → cascades down; uncheck child → parent becomes indeterminate
