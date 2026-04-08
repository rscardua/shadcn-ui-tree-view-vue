# Tasks: Seleção de linha/elemento como propriedade configurável

**Input**: User request to make row/element selection a configurable prop (default: `false`)
**Prerequisites**: Existing TreeView component with always-on selection behavior

**Tests**: Not requested. Manual verification via demo app.

**Organization**: Single user story — add `enableSelection` prop gating all selection behavior.

---

## Phase 1: Setup

**Purpose**: Add the new prop to the type system and injection key

- [X] T001 [P] Add `enableSelection?: boolean` to `TreeViewProps` interface in `vue/src/components/tree-view/types.ts`
- [X] T002 [P] Add `TREE_ENABLE_SELECTION` injection key (`InjectionKey<boolean>`) in `vue/src/components/tree-view/keys.ts`

---

## Phase 2: Core — Gate selection behavior in TreeView.vue

**Purpose**: Disable all selection logic when `enableSelection` is `false`

**Scope in `vue/src/components/tree-view/TreeView.vue`**:

- [X] T003 Add `enableSelection` to `withDefaults` with default value `false` in `vue/src/components/tree-view/TreeView.vue`
- [X] T004 Guard `handleSelect` function: early-return when `enableSelection` is `false` (still allow folder expand/collapse on click, just skip the selection logic) in `vue/src/components/tree-view/TreeView.vue`
- [X] T005 Guard drag-select: skip `handleMouseDown` and `handleMouseMove` selection logic when `enableSelection` is `false` in `vue/src/components/tree-view/TreeView.vue`
- [X] T006 Guard click-away handler: skip `handleClickAway` registration (`onMounted`/`onUnmounted`) when `enableSelection` is `false` in `vue/src/components/tree-view/TreeView.vue`
- [X] T007 Guard selection bar: wrap the `v-if="selectedIds.size > 0"` template block with an additional `enableSelection` check (so the selection bar never shows when disabled) in `vue/src/components/tree-view/TreeView.vue`
- [X] T008 Guard keyboard Enter selection: skip `handleSelect` call in the `Enter` case of `handleKeyDown` when `enableSelection` is `false` in `vue/src/components/tree-view/TreeView.vue`
- [X] T009 Guard `selection-change` watcher: skip emitting `selection-change` when `enableSelection` is `false` in `vue/src/components/tree-view/TreeView.vue`
- [X] T010 Provide `TREE_ENABLE_SELECTION` via `provide(TREE_ENABLE_SELECTION, props.enableSelection)` in `vue/src/components/tree-view/TreeView.vue`

---

## Phase 3: Core — Gate selection visuals in TreeItem.vue

**Purpose**: Remove selection highlight, count badges, and click behavior when selection is disabled

**Scope in `vue/src/components/tree-view/TreeItem.vue`**:

- [X] T011 Inject `TREE_ENABLE_SELECTION` (default `false`) in `vue/src/components/tree-view/TreeItem.vue`
- [X] T012 Guard `isSelected` computed: return `false` when `enableSelection` is `false` (disables orange highlight and `aria-selected`) in `vue/src/components/tree-view/TreeItem.vue`
- [X] T013 Guard `selectedCount` computed: return `null` when `enableSelection` is `false` (hides the count badge on collapsed folders) in `vue/src/components/tree-view/TreeItem.vue`
- [X] T014 Guard `handleClick`: when `enableSelection` is `false`, clicking a folder should only toggle expand/collapse (call `onToggle`), and clicking a leaf should be a no-op, in `vue/src/components/tree-view/TreeItem.vue`

---

## Phase 4: Demo — Update App.vue

**Purpose**: Add toggle for `enableSelection` in the demo and wire it to the TreeView

- [X] T015 Add `enableSelection` reactive ref (default `false`) and a toggle checkbox in the Options panel in `vue/src/App.vue`
- [X] T016 Pass `:enable-selection="enableSelection"` to the `<TreeView>` component in `vue/src/App.vue`
- [X] T017 Conditionally hide the "Selected Items" panel when `enableSelection` is `false` in `vue/src/App.vue`

---

## Phase 5: Validation

- [X] T018 Run `pnpm type-check` and `pnpm build` to verify no type errors or build failures
- [X] T019 Manual verification: confirm selection is disabled by default, and enabling the toggle activates click/drag/shift/ctrl selection

---

## Dependencies & Execution Order

- **Phase 1 (T001–T002)**: Parallel, no dependencies
- **Phase 2 (T003–T010)**: Sequential, depends on Phase 1 (all in same file)
- **Phase 3 (T011–T014)**: Sequential, depends on Phase 1 (T002 for injection key)
- **Phase 4 (T015–T017)**: Depends on Phase 2 (needs the prop to exist)
- **Phase 5 (T018–T019)**: Depends on all previous phases

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- Phase 2 and Phase 3 can run in parallel (different files, both depend only on Phase 1)

---

## Notes

- Total: 19 tasks across 5 phases
- The `enableSelection` prop defaults to `false` as requested
- When `enableSelection` is `false`: no click selection, no drag-select, no selection bar, no orange highlight, no selected count badges, no `selection-change` events
- Folder expand/collapse via click MUST still work when selection is disabled
- Keyboard navigation (ArrowUp/Down/Left/Right) MUST still work for focus — only Enter-to-select is gated
- Checkboxes are independent of selection (controlled by `showCheckboxes`)
- Drag-and-drop selection integration: when both `enableSelection` and `enableDragDrop` are true, multi-drag uses selected nodes; when `enableSelection` is false but `enableDragDrop` is true, only single-node drag works
