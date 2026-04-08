# Tasks: Recursive Select Mode

**Input**: Design documents from `/specs/004-recursive-select-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md

**Tests**: Not requested — manual verification per quickstart.md.

**Organization**: Tasks grouped by implementation phase.

## Path Conventions

- **Project root**: `vue/src/` — Vue 3 component library
- **Component directory**: `vue/src/components/tree-view/`

---

## Phase 1: Setup

*(No tasks — existing project, existing dependencies, existing branch.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions, injection key, and utility functions.

- [x] T001 [P] Add `recursiveSelect?: boolean` prop to `TreeViewProps` interface in `vue/src/components/tree-view/types.ts`
- [x] T002 [P] Add `TREE_RECURSIVE_SELECT` injection key of type `InjectionKey<Ref<boolean>>` in `vue/src/components/tree-view/keys.ts`
- [x] T003 Add utility functions `getAllDescendantIds(item)`, `findAncestors(itemId, data)`, and `getSelectionState(item, selectedIds)` in `vue/src/components/tree-view/utils.ts`

---

## Phase 3: User Story 1 — Independent Checkbox Mode (Priority: P1) MVP

**Goal**: When `recursiveSelect=false` (default), each checkbox reflects only its own `checked` field, without cascading to children or computing from them. Backward compatible.

- [x] T004 [US1] Add `recursiveSelect` prop (default `false`) to `TreeView.vue` props and provide `TREE_RECURSIVE_SELECT` as reactive ref via `toRef(props, 'recursiveSelect')` in `vue/src/components/tree-view/TreeView.vue`
- [x] T005 [US1] Inject `TREE_RECURSIVE_SELECT` in `TreeItem.vue` and modify `checkState` computed: when `recursiveSelect=false`, return checked/unchecked based only on the item's own `checked` field (skip `getCheckState` aggregation) in `vue/src/components/tree-view/TreeItem.vue`

**Checkpoint**: Checkboxes are fully independent. Checking a parent does NOT affect children visually or in data.

---

## Phase 4: User Story 2 — Recursive Checkbox Mode (Priority: P1)

**Goal**: When `recursiveSelect=true`, checking/unchecking a parent propagates to all descendants via multiple `check-change` emits. Parent checkbox visual is calculated from children (checked/unchecked/indeterminate).

- [x] T006 [US2] Modify `handleCheckChange()` in `TreeView.vue` to emit `check-change` for the clicked item AND all descendants recursively when `recursiveSelect=true` in `vue/src/components/tree-view/TreeView.vue`
- [x] T007 [US2] When `recursiveSelect=true`, TreeItem `checkState` uses `getCheckState()` to aggregate child states (existing function, already handles indeterminate) in `vue/src/components/tree-view/TreeItem.vue`

**Checkpoint**: Checking a parent checks all descendants. Partial state shows indeterminate. Unchecking a parent unchecks all descendants.

---

## Phase 5: User Story 3 — Indeterminate State (Priority: P2)

**Goal**: Parent shows indeterminate checkbox when some but not all children are checked (only in recursive mode).

- [x] T008 [US3] Verify `getCheckState()` returns `'indeterminate'` for partially checked parents in `vue/src/components/tree-view/utils.ts`
- [x] T009 [US3] Verify `aria-checked="mixed"` is applied when `checkState === 'indeterminate'` in `vue/src/components/tree-view/TreeItem.vue`
- [x] T010 [US3] Verify indeterminate propagates upward through ancestor levels in `vue/src/components/tree-view/TreeItem.vue`

**Checkpoint**: Partial selection shows dash icon in parent checkbox at all ancestor levels.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T011 [P] Add toggle in `vue/src/App.vue` to switch between recursive and independent checkbox modes
- [x] T012 [P] Update `handleCheckChange` in App.vue to propagate only when `recursiveSelect=true`
- [x] T013 Verify runtime toggle preserves checkbox state and switches behavior immediately
- [x] T014 Run `pnpm type-check` and `pnpm build` — no errors
- [ ] T015 Run `pnpm dev` and execute full manual test checklist from quickstart.md

---

## Manual Test Checklist

1. **Mode false (default)**: check parent → only parent checked, children untouched
2. **Mode false**: uncheck parent → only parent unchecked, children untouched
3. **Mode false**: check child → only child checked, parent untouched
4. **Mode true**: check parent → parent + all descendants checked
5. **Mode true**: uncheck parent → parent + all descendants unchecked
6. **Mode true**: check 1 of 3 children → parent shows indeterminate
7. **Mode true**: check remaining children → parent transitions to checked
8. **Toggle**: switch from true to false → checkboxes reflect individual `checked` fields
9. **Toggle**: switch from false to true → parent checkbox recalculates from children
10. **Leaf nodes**: behave the same in both modes
