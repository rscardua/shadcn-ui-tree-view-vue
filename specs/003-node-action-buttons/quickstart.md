# Quickstart: Node Action Buttons

**Feature**: 003-node-action-buttons
**Date**: 2026-04-08

## Implementation Order

### Step 1: Tooltip UI Components

Create `vue/src/components/ui/tooltip/` with shadcn-style wrappers around Reka UI tooltip primitives. Follow the exact pattern used by `hover-card/`:

- `Tooltip.vue` — wraps `TooltipRoot` with `useForwardPropsEmits`
- `TooltipProvider.vue` — wraps `TooltipProvider` with `useForwardPropsEmits`
- `TooltipTrigger.vue` — wraps `TooltipTrigger` with `useForwardProps`
- `TooltipContent.vue` — wraps `TooltipContent` + `TooltipPortal`, adds Tailwind styling and `cn()` class merging
- `index.ts` — re-exports all components

### Step 2: Type Definitions

Add to `vue/src/components/tree-view/types.ts`:

- `TreeViewNodeAction` interface
- `TreeViewNodeActionsMap` type alias
- Update `TreeViewProps` to include optional `nodeActions` field

### Step 3: Injection Keys

Add to `vue/src/components/tree-view/keys.ts`:

- `TREE_NODE_ACTIONS` — `InjectionKey<TreeViewNodeActionsMap>`
- `TREE_ON_NODE_ACTION` — `InjectionKey<(actionId: string, item: TreeViewItem) => void>`

### Step 4: TreeView.vue

- Add `nodeActions` to props
- Add `node-action` to emits
- `provide(TREE_NODE_ACTIONS, ...)` and `provide(TREE_ON_NODE_ACTION, ...)`

### Step 5: TreeItem.vue

- Inject `TREE_NODE_ACTIONS` and `TREE_ON_NODE_ACTION`
- Add `currentNodeActions` computed
- Add `handleNodeAction` function
- Insert action button template in both folder and leaf row layouts (before the HoverCard info button)
- Import Tooltip components

### Step 6: Demo Update (App.vue)

- Define a `nodeActions` map with actions for `region`, `store`, and `item` node types
- Pass `:node-actions="nodeActions"` to TreeView
- Add `@node-action` handler (console.log for demo)

## Verification

After implementation, verify manually:

1. Hover over nodes of different types → correct action buttons appear
2. Click an action button → callback fires and console shows event
3. Click an action button → node is NOT selected
4. Hover over action button → tooltip appears
5. Remove `:node-actions` prop → tree behaves as before
6. Existing features (selection, checkboxes, expand, context menu, search) still work
