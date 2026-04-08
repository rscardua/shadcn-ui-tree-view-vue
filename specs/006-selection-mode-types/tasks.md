# Tasks: Selection Mode Types

**Input**: Design documents from `/specs/006-selection-mode-types/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md, quickstart.md

**Tests**: No automated tests requested. Manual verification via demo app (per plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define new types and replace injection keys that all modes depend on

- [x] T001 [P] Add `SelectionMode` type and replace `recursiveSelect` with `mode` in `TreeViewProps` in `vue/src/components/tree-view/types.ts`
- [x] T002 [P] Replace `TREE_RECURSIVE_SELECT` injection key with `TREE_CHECK_MODE` of type `Ref<SelectionMode>` in `vue/src/components/tree-view/keys.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add propagation helper functions and wire up the new `mode` prop in TreeView and TreeItem so all user story modes can build on them

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `getDescendants(item: TreeViewItem): TreeViewItem[]` helper that returns all descendant nodes (flattened) in `vue/src/components/tree-view/utils.ts`
- [x] T004 Add `getAffectedAncestors(item: TreeViewItem, itemMap: Map, newCheckedValue: boolean): { item: TreeViewItem, checked: boolean }[]` helper that walks up the tree computing projected ancestor states in `vue/src/components/tree-view/utils.ts`
- [x] T005 Replace `recursiveSelect` prop with `mode` prop (type `SelectionMode`, default `'independent'`) and replace `provide(TREE_RECURSIVE_SELECT)` with `provide(TREE_CHECK_MODE)` in `vue/src/components/tree-view/TreeView.vue`
- [x] T006 Replace `inject(TREE_RECURSIVE_SELECT)` with `inject(TREE_CHECK_MODE)` and update `checkState` computed to branch on mode value (`'independent'`/`'top-down'` → direct `item.checked`, `'bottom-up'`/`'recursive'` → `getCheckState()`) in `vue/src/components/tree-view/TreeItem.vue`
- [x] T007 Update leaf node checkbox rendering in TreeItem to use `checkState` computed instead of direct `item.checked` for consistency in `vue/src/components/tree-view/TreeItem.vue`

**Checkpoint**: Foundation ready — `mode` prop wired, injection key replaced, TreeItem renders based on mode. All modes default to `independent` behavior.

---

## Phase 3: User Story 1 — Non-Recursive Checkbox Selection (Priority: P1) 🎯 MVP

**Goal**: `mode: 'independent'` (default) — checking a node only affects that node, no propagation. Preserves existing default behavior.

**Independent Test**: Check a parent node → verify children remain unchecked. Check a child node → verify parent remains unchanged. Omit `mode` prop → verify identical behavior.

### Implementation for User Story 1

- [x] T008 [US1] Implement `handleCheckChange` for `'independent'` mode in `vue/src/components/tree-view/TreeView.vue` — emit single `check-change` event for the clicked node only (baseline behavior)
- [x] T009 [US1] Update demo in `vue/src/App.vue` — replace `recursiveSelect` toggle with mode selector dropdown (radio or select), set default to `'independent'`, simplify `handleCheckChange` to per-node update only

**Checkpoint**: Independent mode fully functional. Existing default behavior preserved. Demo app shows mode selector.

---

## Phase 4: User Story 2 — Top-Down Recursive Selection (Priority: P2)

**Goal**: `mode: 'top-down'` — checking a parent cascades to all descendants. Children don't affect parents.

**Independent Test**: Check a parent with 3 children → all 4 become checked. Check a child → parent unchanged. Test with 3+ nesting levels.

### Implementation for User Story 2

- [x] T010 [US2] Add `'top-down'` branch to `handleCheckChange` in `vue/src/components/tree-view/TreeView.vue` — use `getDescendants()` to collect all descendants, emit `check-change` for clicked node then each descendant in tree order
- [x] T011 [US2] Verify top-down mode in demo app `vue/src/App.vue` — select `'top-down'` mode and test cascading check/uncheck on parent nodes

**Checkpoint**: Top-down mode fully functional. Parent checks cascade down, children don't affect parents.

---

## Phase 5: User Story 3 — Bottom-Up Recursive Selection (Priority: P3)

**Goal**: `mode: 'bottom-up'` — children's state rolls up to ancestors. Parents don't cascade down. Indeterminate state shown when partially checked.

**Independent Test**: Check all children of a parent → parent auto-checks. Uncheck one child → parent shows indeterminate. Check a parent directly → children unchanged.

### Implementation for User Story 3

- [x] T012 [US3] Add `'bottom-up'` branch to `handleCheckChange` in `vue/src/components/tree-view/TreeView.vue` — emit `check-change` for clicked node, then use `getAffectedAncestors()` to compute and emit projected ancestor state changes bottom-to-top
- [x] T013 [US3] Verify bottom-up mode in demo app `vue/src/App.vue` — select `'bottom-up'` mode and test ancestor auto-check, indeterminate state, and that parent checking doesn't cascade down

**Checkpoint**: Bottom-up mode fully functional. Indeterminate state displays correctly.

---

## Phase 6: User Story 4 — Bidirectional Recursive Selection (Priority: P4)

**Goal**: `mode: 'recursive'` — combines top-down and bottom-up. Replaces old `recursiveSelect: true` behavior.

**Independent Test**: Check parent → all descendants checked. Uncheck one child → parent becomes indeterminate. Check all children individually → parent auto-checks.

### Implementation for User Story 4

- [x] T014 [US4] Add `'recursive'` branch to `handleCheckChange` in `vue/src/components/tree-view/TreeView.vue` — combine top-down (`getDescendants()`) and bottom-up (`getAffectedAncestors()`) propagation, emitting events for clicked node, then descendants, then affected ancestors
- [x] T015 [US4] Verify recursive mode in demo app `vue/src/App.vue` — select `'recursive'` mode and test bidirectional propagation matches old `recursiveSelect: true` behavior

**Checkpoint**: All four modes fully functional and independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, cleanup, and final validation

- [x] T016 [P] Add fallback for invalid `mode` values — default to `'independent'` behavior in `vue/src/components/tree-view/TreeView.vue`
- [x] T017 [P] Verify runtime mode switching works correctly in demo app `vue/src/App.vue` — change mode dynamically and confirm new mode takes effect on next interaction without altering existing check states
- [x] T018 Run `pnpm type-check` and `pnpm build` to validate no TypeScript errors
- [x] T019 Run quickstart.md validation — verify all four modes against the verification checklist in `specs/006-selection-mode-types/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — can run in parallel with US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) — can run in parallel with US1/US2/US3 but logically combines US2+US3 patterns
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — no dependencies on other stories
- **User Story 2 (P2)**: Independent — uses `getDescendants()` from Phase 2
- **User Story 3 (P3)**: Independent — uses `getAffectedAncestors()` from Phase 2
- **User Story 4 (P4)**: Logically builds on US2 + US3 patterns but can be implemented independently since helpers are in Phase 2

### Within Each User Story

- Core `handleCheckChange` implementation before demo verification
- All modes share the same files (`TreeView.vue`, `App.vue`) so within-phase tasks are sequential

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel (different files)
- T016 and T017 (Polish) can run in parallel (different files)
- User stories can theoretically run in parallel since they modify different branches within the same function, but sequential execution (P1→P2→P3→P4) is recommended since they all touch `TreeView.vue`

---

## Parallel Example: Setup Phase

```bash
# Launch both Setup tasks together (different files):
Task: "Add SelectionMode type in vue/src/components/tree-view/types.ts"
Task: "Replace injection key in vue/src/components/tree-view/keys.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + keys)
2. Complete Phase 2: Foundational (helpers + prop wiring)
3. Complete Phase 3: User Story 1 (independent mode)
4. **STOP and VALIDATE**: Test independent mode — should match previous default behavior
5. Demo ready with mode selector UI

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP! (default behavior preserved)
3. Add User Story 2 → Test top-down cascading
4. Add User Story 3 → Test bottom-up rollup + indeterminate
5. Add User Story 4 → Test bidirectional (full recursive)
6. Polish → Edge cases, type-check, build validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All modes share `TreeView.vue` so sequential implementation within phases is recommended
- `getCheckState()` in utils.ts already handles tri-state computation — no changes needed
- Consumer `handleCheckChange` becomes simpler: just update the single reported node per event
- Commit after each phase for clean git history
