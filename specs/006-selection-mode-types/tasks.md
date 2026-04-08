# Tasks: Fix Bottom-Up Selection Mode Ancestor Propagation

**Input**: Design documents from `/specs/006-selection-mode-types/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md, quickstart.md

**Tests**: No automated tests requested. Manual verification via demo app.

**Organization**: Tasks are grouped by concern — diagnosis, core fix, visual fix, and validation.

**Bug Context**: Bottom-up mode (`mode: 'bottom-up'`) is not propagating check state to ancestor nodes. When all children of a parent are checked, the parent should auto-check (FR-006, US3 acceptance scenario 1). The root cause is that `handleCheckChange` emits the clicked node's event synchronously before computing ancestor propagation, and the interleaved state mutations create timing inconsistencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Diagnosis

**Purpose**: Confirm the exact failure scenario and trace data flow

- [x] T001 Add temporary `console.log` inside `handleCheckChange` in `vue/src/components/tree-view/TreeView.vue` to log: (a) `mode` value, (b) the `item.id` and `checked` value passed in, (c) the result of `getAffectedAncestors` (the array of affected ancestors), and (d) whether `props.data` references match `itemMap.value` entries — then test in the demo app with bottom-up mode by checking all children of "Mechanics" one by one and observing if ancestors are detected
- [x] T002 Verify in the browser console that when the last sibling under "Mechanics" is checked, `getAffectedAncestors` returns an array that includes `mechanics` — if the array is empty, the bug is in the computation; if it contains mechanics but the parent still doesn't auto-check, the bug is in the emit or consumer handling

**Checkpoint**: Root cause confirmed — either computation or emit/consumer path identified as failing.

---

## Phase 2: Core Fix — Batch Emit Pattern

**Purpose**: Refactor `handleCheckChange` to compute ALL affected nodes before emitting ANY events, eliminating synchronous emit timing issues

**⚠️ CRITICAL**: This is the primary fix. The current code emits `check-change` for the clicked node at line 211 BEFORE computing ancestors at line 234. Vue 3's synchronous `emit()` causes the parent handler to mutate `treeData.value` mid-computation, creating stale references.

- [x] T003 [US3] Refactor `handleCheckChange` in `vue/src/components/tree-view/TreeView.vue` to batch all events: (1) collect clicked node event into a local array, (2) collect top-down descendant events if applicable, (3) collect bottom-up ancestor events via `getAffectedAncestors`, (4) ONLY THEN emit all collected events in order — this ensures `getAffectedAncestors` reads consistent state from `props.data` and `itemMap.value` before any consumer mutations occur
- [x] T004 [US3] Verify `getAffectedAncestors` in `vue/src/components/tree-view/utils.ts` correctly walks from immediate parent to root: confirm `findAncestors` returns ancestors in root-to-leaf order and the reverse iteration (`ancestors.length - 1` to `0`) processes bottom-to-top — also verify the `pendingChanges` map correctly projects ancestor states when an ancestor is marked checked (so grandparent computation uses the pending ancestor state)

**Checkpoint**: `handleCheckChange` now computes all events atomically before emitting. No interleaved state mutations.

---

## Phase 3: Visual State Fix — TreeItem checkState

**Purpose**: Ensure TreeItem correctly computes and displays indeterminate/checked visual state for parent nodes in bottom-up mode

- [x] T005 [US3] Review and fix the `checkState` computed property in `vue/src/components/tree-view/TreeItem.vue` for `bottom-up` mode (lines 91-106) — verify that: (a) when some children are checked, parent shows `indeterminate`, (b) when ALL children are checked, parent shows `checked`, (c) when a parent is directly checked (no children checked), parent shows `checked`, (d) when a directly-checked parent has a child checked, the visual state correctly reflects the combined state

**Checkpoint**: Parent nodes in bottom-up mode display correct visual state (checked, unchecked, indeterminate) in all scenarios.

---

## Phase 4: Recursive Mode Regression Check

**Purpose**: Ensure the batch-emit refactor doesn't break recursive mode, which also uses `getAffectedAncestors`

- [x] T006 [US4] Verify `recursive` mode still works after the batch-emit refactor in `vue/src/components/tree-view/TreeView.vue` — test: (a) check parent → all descendants checked, (b) uncheck one child → parent shows indeterminate, (c) check all children individually → parent auto-checks

**Checkpoint**: Recursive mode (bidirectional propagation) still functions correctly.

---

## Phase 5: Cleanup & Validation

**Purpose**: Remove debug code and run final validation

- [x] T007 Remove all temporary `console.log` statements added in T001 from `vue/src/components/tree-view/TreeView.vue`
- [x] T008 Run `pnpm type-check` and `pnpm build` to validate no TypeScript errors
- [x] T009 Run full quickstart.md verification against all four modes in the demo app `vue/src/App.vue`:
  1. `independent`: check parent → only parent changes
  2. `top-down`: check parent → parent + all descendants change
  3. `bottom-up`: check all children of Mechanics → Mechanics auto-checks; uncheck one child → Mechanics becomes indeterminate; check parent directly → only parent changes
  4. `recursive`: check parent → cascades down; uncheck child → parent becomes indeterminate; check all children → parent auto-checks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Diagnosis (Phase 1)**: No dependencies — start immediately
- **Core Fix (Phase 2)**: Depends on Phase 1 — confirms which path to fix
- **Visual Fix (Phase 3)**: Depends on Phase 2 — needs consistent data to verify visual state
- **Regression (Phase 4)**: Depends on Phase 2 — tests the refactored code
- **Cleanup (Phase 5)**: Depends on all previous phases

### Within Each Phase

- T001 → T002 (sequential: diagnosis depends on logging being in place)
- T003 → T004 (sequential: verify helper after main function is refactored)
- T005 can run after T003 is complete
- T006 can run after T003 is complete (parallel with T005)
- T007 → T008 → T009 (sequential: cleanup → build → validate)

### Parallel Opportunities

- T005 and T006 (Phase 3 and Phase 4) can run in parallel after T003 completes
- T001 and T002 are sequential but fast (diagnosis only)

---

## Implementation Strategy

### Fix Approach

The primary fix (T003) changes `handleCheckChange` from:
```
emit(clicked) → compute ancestors → emit(ancestors)
```
To:
```
collect(clicked) → compute ancestors → collect(ancestors) → emit(all)
```

This ensures `getAffectedAncestors` reads from `props.data` and `itemMap.value` BEFORE any consumer handler has had a chance to mutate the tree data.

### Key Files

| File | Change |
|------|--------|
| `vue/src/components/tree-view/TreeView.vue` | Refactor `handleCheckChange` to batch events |
| `vue/src/components/tree-view/utils.ts` | Verify `getAffectedAncestors` and `findAncestors` correctness |
| `vue/src/components/tree-view/TreeItem.vue` | Verify `checkState` computed for bottom-up mode |

---

## Notes

- The bug affects both `bottom-up` and potentially `recursive` mode (which also uses `getAffectedAncestors`)
- The batch-emit pattern is the safest fix because it eliminates the timing dependency entirely
- Per FR-012 and contracts/component-api.md, events should be emitted in order: clicked node → descendants → ancestors
- The `pendingChanges` map in `getAffectedAncestors` is critical for multi-level propagation (e.g., child auto-checks parent, which then auto-checks grandparent)
