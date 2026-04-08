# Quickstart: 004-recursive-select-mode

**Date**: 2026-04-08

## Prerequisites

- Node.js 18+
- pnpm installed
- Repository cloned and on branch `004-recursive-select-mode`

## Setup

```bash
cd vue
pnpm install
pnpm dev
```

## Key Files to Modify

| File | Change |
|------|--------|
| `vue/src/components/tree-view/types.ts` | Add `recursiveSelect` to `TreeViewProps` |
| `vue/src/components/tree-view/keys.ts` | Add `TREE_RECURSIVE_SELECT` injection key |
| `vue/src/components/tree-view/utils.ts` | Add `getAllDescendantIds`, `findAncestors`, `getSelectionState` |
| `vue/src/components/tree-view/TreeView.vue` | Add prop, provide key, modify `handleSelect` for recursive propagation |
| `vue/src/components/tree-view/TreeItem.vue` | Consume `TREE_RECURSIVE_SELECT`, compute indeterminate visual state |
| `vue/src/App.vue` | Add demo toggle for recursive select mode |

## Implementation Order

1. **Types & keys** — Add prop type and injection key (no logic changes)
2. **Utils** — Add pure utility functions (testable independently)
3. **TreeView.vue** — Wire prop, provide, modify selection handlers
4. **TreeItem.vue** — Add indeterminate visual state
5. **App.vue** — Demo integration with toggle

## Verification

```bash
cd vue
pnpm type-check   # Verify TypeScript compiles
pnpm dev           # Manual testing in browser
```

### Manual Test Checklist

1. Default mode (no prop): selection behaves exactly as before
2. `recursive-select` enabled: click parent → all descendants selected
3. `recursive-select` enabled: click selected parent → all descendants deselected
4. `recursive-select` enabled: click individual child → parent shows indeterminate
5. Ctrl+click works with recursive propagation
6. Shift+click range includes descendants
7. Deeply nested tree (5+ levels) propagates correctly
