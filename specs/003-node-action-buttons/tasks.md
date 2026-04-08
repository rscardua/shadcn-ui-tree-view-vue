# Tasks: Node Action Buttons

**Input**: Design documents from `/specs/003-node-action-buttons/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested — manual verification via demo app (per plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `vue/src/`
- **Tree view components**: `vue/src/components/tree-view/`
- **UI components**: `vue/src/components/ui/`
- **Demo**: `vue/src/App.vue`

---

## Phase 1: Setup

**Purpose**: No setup needed — project structure already exists. Skipped.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, injection keys, and tooltip UI components that multiple user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Create tooltip UI wrapper components in `vue/src/components/ui/tooltip/` — five files: `Tooltip.vue`, `TooltipProvider.vue`, `TooltipTrigger.vue`, `TooltipContent.vue`, `index.ts`. Follow the shadcn/Reka UI wrapper pattern used by `hover-card/` (see research.md R1). Use `useForwardPropsEmits` for root/provider, `useForwardProps` for trigger, and add `TooltipPortal` + Tailwind styling + `cn()` in content.
- [x] T002 [P] Add `TreeViewNodeAction` interface and `TreeViewNodeActionsMap` type to `vue/src/components/tree-view/types.ts` per contracts/tree-view-api.md. Export both types.
- [x] T003 [P] Add `TREE_NODE_ACTIONS` and `TREE_ON_NODE_ACTION` injection keys to `vue/src/components/tree-view/keys.ts` per contracts/tree-view-api.md. Follow the existing `InjectionKey` pattern.

**Checkpoint**: Foundation ready — tooltip components exist, types are defined, injection keys are in place.

---

## Phase 3: User Story 1 — Configure action buttons per node type (Priority: P1) 🎯 MVP

**Goal**: Developers can pass a `nodeActions` map to the tree view and see the correct action buttons rendered on hover for each node type.

**Independent Test**: Pass a `nodeActions` config with actions for "region" and "store" types. Hover over nodes — verify correct buttons appear per type. Hover over a type with no actions — verify no buttons. Omit the prop entirely — verify no buttons on any node.

### Implementation for User Story 1

- [x] T004 [US1] Add `nodeActions` optional prop to `vue/src/components/tree-view/TreeView.vue` and `provide(TREE_NODE_ACTIONS, ...)` the reactive value to descendants. Import the new types and keys.
- [x] T005 [US1] In `vue/src/components/tree-view/TreeItem.vue`: inject `TREE_NODE_ACTIONS`, add `currentNodeActions` computed property that resolves actions for the current item's type, and render action buttons (icon via `<component :is>`) in both folder and leaf row templates. Position buttons with `ml-auto` before the existing HoverCard info button (see research.md R3). Use `@click.stop` on each button for click isolation.

**Checkpoint**: Action buttons are visible on hover per node type. Clicking them is isolated from selection. No event handling yet.

---

## Phase 4: User Story 2 — Execute an action and receive feedback (Priority: P1)

**Goal**: Clicking an action button invokes the optional callback and always emits a `node-action` event to the parent component.

**Independent Test**: Click an action button that has a callback — verify callback fires with node data. Click any action button — verify parent receives `node-action` event with action ID and node data. Verify clicking does NOT trigger selection or expand/collapse.

**Depends on**: US1 (buttons must exist in template to be clickable)

### Implementation for User Story 2

- [x] T006 [US2] Add `'node-action'` emit definition to `vue/src/components/tree-view/TreeView.vue` and `provide(TREE_ON_NODE_ACTION, ...)` handler that emits the event. Import the new key.
- [x] T007 [US2] In `vue/src/components/tree-view/TreeItem.vue`: inject `TREE_ON_NODE_ACTION`, implement `handleNodeAction(action, item)` function that calls `action.action?.(item)` first then invokes the injected handler with `(action.id, item)`. Wire `@click.stop="handleNodeAction(action, item)"` on each action button (update the template from T005).

**Checkpoint**: Action buttons are fully functional — callbacks fire, events emit, clicks are isolated.

---

## Phase 5: User Story 3 — Tooltips on action buttons (Priority: P2)

**Goal**: Hovering over an action button shows a tooltip with the configured text.

**Independent Test**: Hover over an action button — verify tooltip with configured text appears. Move cursor away — verify tooltip disappears.

**Depends on**: US1 (buttons must exist), Phase 2 (tooltip components)

### Implementation for User Story 3

- [x] T008 [US3] In `vue/src/components/tree-view/TreeItem.vue`: import tooltip components from `components/ui/tooltip`, wrap each action button with `<TooltipProvider>`, `<Tooltip>`, `<TooltipTrigger>` (as the button), and `<TooltipContent>` rendering `action.tooltip`. Apply to both folder and leaf row templates.

**Checkpoint**: Tooltips appear on all action buttons with correct text.

---

## Phase 6: User Story 4 — Visual presentation and transitions (Priority: P2)

**Goal**: Action buttons appear smoothly on hover and disappear when not hovering, keeping the tree clean at rest.

**Independent Test**: Hover over a node row — verify action buttons fade in with a smooth opacity transition. Move cursor away — verify buttons fade out. View tree at rest — verify no action buttons visible.

**Depends on**: US1 (buttons must exist in template)

### Implementation for User Story 4

- [x] T009 [US4] In `vue/src/components/tree-view/TreeItem.vue`: ensure action buttons container uses the existing `group-hover:opacity-100 opacity-0 transition-opacity` pattern (same as the existing info HoverCard button). Verify the parent row element has the `group` class. Apply to both folder and leaf row templates.

**Checkpoint**: Action buttons have smooth hover transitions, tree is clean at rest.

---

## Phase 7: User Story 5 — Updated demo showcasing node actions (Priority: P3)

**Goal**: The demo application showcases the node action buttons feature with realistic examples across multiple node types.

**Independent Test**: Run `pnpm dev`, hover over nodes of different types — verify type-specific action buttons appear. Click an action — verify console output. Verify at least 3 node types have distinct action sets (SC-004).

**Depends on**: US1, US2, US3, US4 (all component work should be complete)

### Implementation for User Story 5

- [x] T010 [US5] In `vue/src/App.vue`: import Lucide icons (e.g., `Pencil`, `Trash2`, `MapPin`, `Eye`, `Package`), define a `nodeActions` map with distinct actions for at least `region`, `store`, and `item` node types. Pass `:node-actions="nodeActions"` to the `<TreeView>` component. Add `@node-action="(actionId, item) => console.log('Action:', actionId, item)"` handler. Optionally add inline callbacks on some actions for demo variety.

**Checkpoint**: Demo showcases the complete feature with multiple node types, icons, tooltips, and observable feedback.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and backward compatibility check.

- [x] T011 Run quickstart.md verification checklist — confirm all 6 manual test scenarios pass
- [x] T012 Verify backward compatibility — remove `:node-actions` prop from demo and confirm tree behaves identically to before the feature (FR-011)
- [x] T013 Verify coexistence with existing hover info buttons — confirm action buttons and HoverCard info buttons display together without overlap (FR-013)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — project already exists
- **Foundational (Phase 2)**: No dependencies — can start immediately. **BLOCKS all user stories.**
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on US1 (needs buttons in template)
- **US3 (Phase 5)**: Depends on US1 + Phase 2 tooltip components
- **US4 (Phase 6)**: Depends on US1 (needs buttons in template)
- **US5 (Phase 7)**: Depends on US1, US2, US3, US4
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no story dependencies
- **US2 (P1)**: Depends on US1 — needs action buttons in template to wire handlers
- **US3 (P2)**: Depends on US1 — needs action buttons to wrap with tooltips. Can run in parallel with US2 and US4.
- **US4 (P2)**: Depends on US1 — needs action button container for CSS classes. Can run in parallel with US2 and US3.
- **US5 (P3)**: Depends on all other stories — demo should showcase complete feature

### Parallel Opportunities

- **Phase 2**: T001, T002, T003 can all run in parallel (different files)
- **After US1**: US2, US3, US4 can run in parallel (US2 adds handler logic, US3 wraps with tooltips, US4 adds CSS — different concerns, but all modify TreeItem.vue so sequencing may be needed in practice)
- **Recommended sequence**: Phase 2 → US1 → US2 → US3 + US4 → US5 → Polish

---

## Parallel Example: Phase 2 (Foundational)

```text
# Launch all foundational tasks together:
Task: "Create tooltip UI components in vue/src/components/ui/tooltip/"
Task: "Add types to vue/src/components/tree-view/types.ts"
Task: "Add injection keys to vue/src/components/tree-view/keys.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 2: Foundational (tooltip, types, keys)
2. Complete Phase 3: US1 — buttons appear per node type
3. Complete Phase 4: US2 — buttons are clickable with callbacks and events
4. **STOP and VALIDATE**: Buttons appear, clicks work, events fire
5. This is a functional MVP — tooltips and transitions are polish

### Incremental Delivery

1. Phase 2 → Foundation ready
2. US1 → Buttons visible on hover → Validate
3. US2 → Buttons functional → Validate (MVP!)
4. US3 → Tooltips added → Validate
5. US4 → Transitions polished → Validate
6. US5 → Demo updated → Validate
7. Polish → Full verification → Done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No automated tests — plan.md specifies manual verification via demo app
- All tree-view changes modify existing files (TreeView.vue, TreeItem.vue, types.ts, keys.ts)
- Tooltip components are the only new files (5 files in `components/ui/tooltip/`)
- Click isolation uses `@click.stop` per research.md R4
- Dual handler pattern (callback + event) per research.md R5
