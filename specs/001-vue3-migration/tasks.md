# Tasks: Vue 3 Tree View Migration

**Input**: Design documents from `/specs/001-vue3-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Verification is manual via the demo application.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All Vue source files live under `vue/src/`
- Tree view components: `vue/src/components/tree-view/`
- shadcn-vue UI components: `vue/src/components/ui/`
- Utilities: `vue/src/lib/`

---

## Phase 1: Setup

**Purpose**: Initialize the Vue 3 project under `vue/` with all tooling and dependencies

- [x] T001 Scaffold Vite + Vue 3 + TypeScript project in `vue/` directory using `pnpm create vue@latest` (select TypeScript, no router, no Pinia, no Vitest, no E2E, no ESLint — will configure manually)
- [x] T002 Initialize shadcn-vue in `vue/` by running `pnpm dlx shadcn-vue@latest init` to set up `components.json`, Tailwind CSS v4, `vue/src/lib/utils.ts` (cn utility), and base CSS in `vue/src/assets/index.css`
- [x] T003 Install `@lucide/vue` icon package: `pnpm add @lucide/vue` in `vue/`
- [x] T004 Add required shadcn-vue UI components by running in `vue/`: `pnpm dlx shadcn-vue@latest add badge button checkbox collapsible context-menu dialog hover-card input scroll-area` — this creates files under `vue/src/components/ui/`
- [x] T005 Verify project builds and dev server starts: run `pnpm dev` in `vue/`, confirm blank app loads at localhost:5173

**Checkpoint**: Vue 3 project scaffolded with all dependencies and UI components installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared types, injection keys, and utility functions that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create TypeScript interfaces in `vue/src/components/tree-view/types.ts`: export `TreeViewItem`, `TreeViewMenuItem`, `TreeViewIconMap`, `TreeViewProps`, `TreeViewEmits` per contracts/component-api.md
- [x] T007 [P] Create provide/inject keys in `vue/src/components/tree-view/keys.ts`: export all typed `InjectionKey` symbols (`TREE_SELECTED_IDS`, `TREE_EXPANDED_IDS`, `TREE_FOCUSED_ID`, `TREE_ITEM_MAP`, `TREE_ON_SELECT`, `TREE_ON_TOGGLE`, `TREE_ON_CHECK`, `TREE_SHOW_CHECKBOXES`, `TREE_ICON_MAP`, `TREE_MENU_ITEMS`, `TREE_DATA`) per data-model.md
- [x] T008 [P] Create utility functions in `vue/src/components/tree-view/utils.ts`: implement `buildItemMap(data)` for O(1) lookups, `getAllFolderIds(data)` for expand-all, `getItemPath(item, data)` for breadcrumb paths, `filterTree(data, query)` for search filtering with ancestor preservation, `getSelectedChildrenCount(item, selectedIds)` for badge counts, `getVisibleItems(data, expandedIds)` for flat ordered list of visible items
- [x] T009 [P] Create sample tree data in `vue/src/lib/demo-data.ts`: port the retail store hierarchy from the React `lib/demo_data.ts` (regions, stores, departments, items) with matching IDs and structure

**Checkpoint**: Foundation ready — all shared code in place, user story implementation can begin

---

## Phase 3: User Story 1 — Render and Navigate a Tree Structure (Priority: P1) MVP

**Goal**: Render hierarchical tree data with expand/collapse, icons, and smooth animations

**Independent Test**: Provide sample tree data → nodes render with icons → folders expand/collapse on click → expand all/collapse all buttons work

### Implementation for User Story 1

- [x] T010 [US1] Create the root `TreeView.vue` component in `vue/src/components/tree-view/TreeView.vue`: implement `<script setup lang="ts">` with `defineProps<TreeViewProps>()`, `defineEmits`, create reactive state (`expandedIds`, `selectedIds`), compute `itemMap` via `buildItemMap`, provide all state and handlers via injection keys from `keys.ts`. Render: header with title, expand all/collapse all buttons (when `showExpandAll` is true), and loop over root `data` items rendering `<TreeItem>` for each
- [x] T011 [US1] Create the recursive `TreeItem.vue` component in `vue/src/components/tree-view/TreeItem.vue`: implement `<script setup lang="ts">` with props `item: TreeViewItem` and `depth: number`. Inject shared state from keys. Compute `isOpen` from `expandedIds`. Render: indented row with chevron icon (CSS `transition: transform 100ms` for rotation), item icon (from `iconMap` or `#icon` scoped slot), item name (or `#label` scoped slot). Wrap children in shadcn-vue `<Collapsible>` with `<CollapsibleContent>` for smooth height animation via `--reka-collapsible-content-height` CSS variable. Self-reference `<TreeItem>` for recursive children rendering
- [x] T012 [US1] Add expand/collapse all handlers in `TreeView.vue`: `handleExpandAll` sets `expandedIds` to all folder IDs via `getAllFolderIds`, `handleCollapseAll` clears `expandedIds`. Wire to buttons in the header. Add `handleToggleExpand(id, isOpen)` handler and provide via `TREE_ON_TOGGLE`
- [x] T013 [US1] Add animation CSS in `vue/src/assets/index.css`: define collapsible content height transition using `--reka-collapsible-content-height` CSS variable (`transition: height 50ms ease`), chevron rotation transition (`transition: transform 100ms`), and `<Transition>` classes for search/selection bar swap (`opacity` + `transform` with `out-in` mode)
- [x] T014 [US1] Add ARIA attributes to TreeView and TreeItem: `role="tree"` on container, `role="treeitem"` on each item, `role="group"` on child containers, `aria-expanded` on folders, `tabindex` management (roving tabindex: focused item gets `tabindex="0"`, others get `tabindex="-1"`)
- [x] T015 [US1] Create demo app in `vue/src/App.vue`: import `TreeView`, use `demo-data.ts` sample data, configure `iconMap` with Lucide icons (Globe, Folder, FolderOpen, File from `@lucide/vue`), render TreeView with `showExpandAll` enabled. Verify tree renders and expand/collapse works with animations

**Checkpoint**: Tree renders with sample data, folders expand/collapse with smooth animation, icons display correctly, ARIA roles in place. User Story 1 is independently functional.

---

## Phase 4: User Story 2 — Select Items in the Tree (Priority: P1)

**Goal**: Enable item selection via single click, Ctrl+click, Shift+click, and drag-select with visual highlighting

**Independent Test**: Click items → visual highlight + selection-change event → Ctrl/Shift/drag selection modes work correctly

### Implementation for User Story 2

- [x] T016 [US2] Create `useTreeSelection` composable in `vue/src/components/tree-view/composables/useTreeSelection.ts`: manage `selectedIds: Ref<Set<string>>` and `lastSelectedId: Ref<string | null>`. Implement `handleSelect(item, event)` with logic for: single click (replace selection), Ctrl/Cmd+click (toggle item in selection), Shift+click (range select using DOM `[data-tree-item]` query to find all visible items between last and current). Emit `selection-change` with resolved item array. Export composable function
- [x] T017 [US2] Create `useTreeDragSelect` composable in `vue/src/components/tree-view/composables/useTreeDragSelect.ts`: manage `isDragging`, `dragStartY`, `currentMouseY`, `dragStartPosition` refs. Implement `handleMouseDown` (record start), `handleMouseMove` (check 10px threshold, compute bounding rects of `[data-tree-item]` elements, select items intersecting drag range respecting `data-folder-closed`), `handleMouseUp` (cleanup). Support Ctrl/Shift modifiers during drag. Export composable function
- [x] T018 [US2] Integrate selection into TreeItem.vue: add `data-tree-item` and `data-item-id` attributes to item element. Compute `isSelected` from injected `selectedIds`. Apply selection highlight CSS classes (blue background). Implement contiguous selection styling (rounded corners on first/last in sequence). Call injected `onSelect` handler on click
- [x] T019 [US2] Integrate selection + drag-select into TreeView.vue: use `useTreeSelection` and `useTreeDragSelect` composables. Provide `TREE_ON_SELECT` handler. Attach mouse event handlers to tree container. Add click-away handler to deselect (ignoring context menu and Radix popper clicks). Add selection count display bar with `<Transition mode="out-in">` to swap between selection bar and search bar
- [x] T020 [US2] Add selected count badge to TreeItem.vue: when a folder is collapsed and has selected descendants, show `<Badge>` with count using `getSelectedChildrenCount` utility. Only display when `!isOpen && count > 0`
- [x] T021 [US2] Update demo `App.vue`: add `@selection-change` handler that logs selected items. Verify all 4 selection modes work in the demo

**Checkpoint**: All selection modes functional (single, multi, range, drag). Selection bar shows count. Badges appear on collapsed folders with selected children.

---

## Phase 5: User Story 3 — Search and Filter the Tree (Priority: P2)

**Goal**: Search input filters tree to matching items preserving hierarchy, auto-expands matches

**Independent Test**: Type search term → tree filters to matches with ancestors → clear search restores original state

### Implementation for User Story 3

- [x] T022 [US3] Create `useTreeSearch` composable in `vue/src/components/tree-view/composables/useTreeSearch.ts`: manage `searchQuery: Ref<string>`. Compute `filteredData` using `filterTree` utility (case-insensitive name match, preserve ancestors). Compute `searchExpandedIds` (all parent IDs of matching items). Watch `searchQuery` to merge `searchExpandedIds` into `expandedIds` when search is active. On clear, revert to pre-search expanded state. Export composable function
- [x] T023 [US3] Integrate search into TreeView.vue: use `useTreeSearch` composable. Add `<Input>` component in the header with `v-model` bound to `searchQuery`, `searchPlaceholder` prop as placeholder. Render `filteredData` instead of raw `data` when search is active. Add the `<Transition mode="out-in">` to swap between search bar (no selection) and selection bar (items selected)
- [x] T024 [US3] Update demo `App.vue`: verify search filters tree correctly, auto-expands matching branches, clears properly

**Checkpoint**: Search fully functional. Filters preserve hierarchy, auto-expands matches, clears restore original state.

---

## Phase 6: User Story 4 — Manage Checkboxes for Access Rights (Priority: P2)

**Goal**: Optional three-state checkboxes with parent-child cascade

**Independent Test**: Enable checkboxes → check parent cascades to children → partial check shows indeterminate → check-change events emit correctly

### Implementation for User Story 4

- [x] T025 [US4] Create `useTreeCheckbox` composable in `vue/src/components/tree-view/composables/useTreeCheckbox.ts`: implement `getCheckState(item, itemMap)` function that recursively computes `"checked" | "unchecked" | "indeterminate"` from children's states. Leaf nodes return their `checked` boolean. Parent nodes: all checked → checked, some → indeterminate, none → unchecked. Export composable function
- [x] T026 [US4] Integrate checkboxes into TreeItem.vue: when `showCheckboxes` is injected as true, render shadcn-vue `<Checkbox>` next to item icon. Bind checkbox state to `getCheckState` result. Map indeterminate state to `aria-checked="mixed"`. On checkbox click, call injected `TREE_ON_CHECK` handler with item and toggled state (indeterminate treated as unchecked → becomes checked)
- [x] T027 [US4] Wire checkbox events in TreeView.vue: implement `handleCheckChange(item, checked)` that emits `check-change` event. Provide handler via `TREE_ON_CHECK` injection key
- [x] T028 [US4] Update demo `App.vue`: enable `showCheckboxes`, add `@check-change` handler that displays checked items in a side panel (JSON format). Add checkbox labels configuration. Verify cascade behavior

**Checkpoint**: Checkboxes render, cascade parent↔children correctly, indeterminate state works, events emit.

---

## Phase 7: User Story 5 — Context Menu Actions (Priority: P3)

**Goal**: Right-click context menu with configurable actions on selected items

**Independent Test**: Right-click item → context menu appears with configured actions → selecting action triggers callback with correct items

### Implementation for User Story 5

- [x] T029 [US5] Integrate context menu into TreeItem.vue: wrap item content in shadcn-vue `<ContextMenu>`. Use `<ContextMenuTrigger>` around the item row. Render `<ContextMenuContent>` with `<ContextMenuItem>` for each item from injected `TREE_MENU_ITEMS`. On menu item click: if clicked item is selected, pass all selected items to action; otherwise pass only the clicked item. Include menu item icon if provided
- [x] T030 [US5] Wire context menu events in TreeView.vue: provide `TREE_MENU_ITEMS` via injection. Implement `onAction` emit forwarding. Update click-away handler to ignore `[role="menu"]` and `[data-radix-popper-content-wrapper]` elements
- [x] T031 [US5] Update demo `App.vue`: configure `menuItems` with "Add to Shipment", "Download", "Delete" actions (matching React demo). Add `@action` handler. Add confirmation `<Dialog>` for send action. Verify context menu works on single and multi-selected items

**Checkpoint**: Context menus appear on right-click with correct actions, apply to selected items appropriately.

---

## Phase 8: User Story 6 — Hover Card with Item Details (Priority: P3)

**Goal**: Floating info card on hover showing item metadata

**Independent Test**: Hover info icon → card shows type, ID, path, child count → mouse away dismisses card

### Implementation for User Story 6

- [x] T032 [US6] Integrate hover card into TreeItem.vue: add an info `<Button>` (ghost variant, small size) that appears on item row hover (`opacity-0 group-hover:opacity-100`). Wrap in shadcn-vue `<HoverCard>` with `<HoverCardTrigger>` and `<HoverCardContent>`. Display: item name (bold), type (formatted), ID, location path via `getItemPath` utility, and child count for folders. Stop click propagation on info button
- [x] T033 [US6] Update demo `App.vue`: verify hover cards display correct metadata for both folders and files

**Checkpoint**: Hover cards show all expected metadata, appear/disappear smoothly.

---

## Phase 9: User Story 7 — Keyboard Navigation (Cross-Cutting, P1)

**Goal**: Full WAI-ARIA Treeview keyboard navigation with roving tabindex

**Independent Test**: Tab into tree → arrow keys move focus → Enter selects → Space toggles checkbox → Home/End jump to first/last → Arrow Right/Left expand/collapse

### Implementation for User Story 7

- [x] T034 [US7] Create `useTreeKeyboard` composable in `vue/src/components/tree-view/composables/useTreeKeyboard.ts`: manage `focusedId: Ref<string | null>`. Compute `visibleItems` flat list from data + expandedIds using `getVisibleItems` utility. Implement `handleKeyDown(event)` with: Arrow Down (next visible item), Arrow Up (previous visible item), Arrow Right (expand folder or move to first child), Arrow Left (collapse folder or move to parent), Enter (select/activate focused item via `onSelect`), Space (toggle checkbox if enabled via `onCheck`), Home (focus first visible item), End (focus last visible item). Update `focusedId` and manage DOM focus via `document.querySelector('[data-item-id="..."]')?.focus()`. Export composable function
- [x] T035 [US7] Integrate keyboard navigation into TreeView.vue: use `useTreeKeyboard` composable. Attach `@keydown` handler to tree container. Provide `TREE_FOCUSED_ID` via injection
- [x] T036 [US7] Update TreeItem.vue for keyboard focus: bind `tabindex` based on `focusedId` (focused item gets `0`, others get `-1`). Apply focus ring styles. Update `data-item-id` attribute for DOM querying. Set initial focus to first item on tree mount
- [x] T037 [US7] Update demo `App.vue`: verify all keyboard interactions work correctly per WAI-ARIA Treeview spec

**Checkpoint**: Full keyboard navigation functional. Roving tabindex pattern working. All ARIA attributes correct.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, edge cases, and demo polish

- [x] T038 [P] Handle edge case: empty tree data renders gracefully without errors in `TreeView.vue`
- [x] T039 [P] Handle edge case: search with no matches shows empty state or "no results" indicator in `TreeView.vue`
- [x] T040 [P] Handle edge case: reactive data updates while search is active re-evaluate filtered view — verify `computed` reactivity in `useTreeSearch`
- [x] T041 [P] Handle edge case: removed selected items update selection state — add `watch` on `data` prop in `TreeView.vue` to prune stale IDs from `selectedIds`
- [x] T042 Verify animation performance: test rapid expand/collapse toggling does not stack or glitch, test with 500+ node tree for jank
- [x] T043 Final demo polish in `vue/src/App.vue`: match React demo layout (tree on left, checked items panel on right), add title, ensure all features are showcased
- [x] T044 Run `pnpm build` in `vue/` and verify production build succeeds without errors or warnings

---

## Phase 11: Visual Bug Fixes — Element Overlap

**Purpose**: Fix layout and rendering issues causing tree elements to visually overlap each other

- [x] T045 [P] Fix horizontal overflow: replace `w-[600px]` with `w-full` on the inner container in `vue/src/components/tree-view/TreeView.vue` so the component fills its parent without escaping the `flex` column in `App.vue`
- [x] T046 [P] Fix App.vue left-panel constraint: replace `max-w-[450px]` with `min-w-0 flex-1` on the left `<div class="flex flex-col gap-4 ...">` in `vue/src/App.vue` so the panel expands to accommodate the TreeView instead of letting it overflow into the right panel
- [x] T047 [P] Remove inner trigger-only Collapsible wrapper in `vue/src/components/tree-view/TreeItem.vue`: the folder row currently wraps the chevron `<Button>` in a `<Collapsible>` that has no matching `<CollapsibleContent>`, causing `CollapsibleRoot` to render an extra block-level `div` inside the `flex items-center` row. Replace with a plain `<Button variant="ghost" size="icon" class="h-6 w-6" @click.stop="() => onToggle(item.id, !isOpen)">` and remove the surrounding `<Collapsible>` and `<CollapsibleTrigger>` wrappers
- [x] T048 [P] Add `overflow-hidden` to the children group wrapper in `vue/src/components/tree-view/TreeItem.vue`: the `<div v-if="item.children" role="group">` container that holds `<CollapsibleContent>` has no overflow clipping, so during the collapse height animation children items can momentarily overflow and overlap adjacent rows. Add `class="overflow-hidden"` to that wrapper div
- [x] T049 [P] Fix item row minimum height: change `h-8` to `min-h-8` on the `<div class="flex items-center h-8">` row element in both the folder and leaf branches of `vue/src/components/tree-view/TreeItem.vue` so items with longer names (e.g. "Conservation of Momentum") are not clipped and do not overflow into adjacent rows

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Tree Rendering (Phase 3)**: Depends on Foundational — this is the MVP
- **US2 Selection (Phase 4)**: Depends on US1 (needs TreeView + TreeItem structure)
- **US3 Search (Phase 5)**: Depends on US1 (needs TreeView structure)
- **US4 Checkboxes (Phase 6)**: Depends on US1 (needs TreeItem structure)
- **US5 Context Menus (Phase 7)**: Depends on US2 (needs selection for multi-item actions)
- **US6 Hover Cards (Phase 8)**: Depends on US1 (needs TreeItem structure)
- **US7 Keyboard Nav (Phase 9)**: Depends on US1 + US2 (needs tree structure + selection handlers)
- **Polish (Phase 10)**: Depends on all user stories being complete
- **Visual Bug Fixes (Phase 11)**: Independent from Phase 10 — these fixes apply to already-implemented files and can run in parallel to any remaining polish work

### Parallel Opportunities After US1

Once Phase 3 (US1) is complete, the following can proceed in parallel:

- US3 Search (Phase 5) — independent of selection
- US4 Checkboxes (Phase 6) — independent of selection
- US6 Hover Cards (Phase 8) — independent of selection

US2 Selection (Phase 4) must complete before:
- US5 Context Menus (Phase 7)
- US7 Keyboard Nav (Phase 9)

### Within Each User Story

- Composable/logic before component integration
- Component integration before demo verification
- Story complete before moving to next priority

### Parallel Opportunities

```text
Phase 2 (all T006-T009 are [P] — run in parallel)

After US1 complete:
  Parallel track A: US2 Selection (Phase 4)
  Parallel track B: US3 Search (Phase 5)
  Parallel track C: US4 Checkboxes (Phase 6)
  Parallel track D: US6 Hover Cards (Phase 8)

After US2 complete:
  Parallel track E: US5 Context Menus (Phase 7)
  Parallel track F: US7 Keyboard Nav (Phase 9)

Phase 10 polish tasks marked [P] can run in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 — Tree Rendering
4. **STOP and VALIDATE**: Tree renders, expands/collapses, icons work, ARIA roles present
5. Demo is usable as a basic tree view

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 Tree Rendering → Test independently → Demo (MVP!)
3. Add US2 Selection → Test independently → Demo
4. Add US3 Search + US4 Checkboxes (parallel) → Test independently → Demo
5. Add US5 Context Menus + US6 Hover Cards (parallel) → Test independently → Demo
6. Add US7 Keyboard Navigation → Test independently → Demo
7. Polish → Final verification → Complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No automated tests — verification is manual via demo app
- All paths relative to `vue/` directory at project root
