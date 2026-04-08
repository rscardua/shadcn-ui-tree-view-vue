# Tasks: Documento de Orientação de Uso para IA — TreeView Component

**Input**: Current component source code in `vue/src/components/tree-view/`
**Prerequisites**: All component features implemented (selection, checkboxes, drag-drop, node actions, recursive select)

**Tests**: Not requested. Manual review of generated document.

**Organization**: Single deliverable — AI usage guide document inside the component directory.

---

## Phase 1: Setup

**Purpose**: Analyze the complete component API surface before writing the guide

- [X] T001 [P] Read and catalog all exported types from `vue/src/components/tree-view/types.ts` (TreeViewItem, TreeViewProps, DropZone, TreeDragDropEvent, TreeViewMenuItem, TreeViewNodeAction, TreeViewNodeActionsMap, TreeViewIconMap)
- [X] T002 [P] Read and catalog all injection keys from `vue/src/components/tree-view/keys.ts` (state keys, event handler keys, drag-drop keys, slot keys)
- [X] T003 [P] Read and catalog all utility functions from `vue/src/components/tree-view/utils.ts` (buildItemMap, filterTree, getAllFolderIds, moveNode, moveMultipleNodes, findParentNode, etc.)
- [X] T004 [P] Read and catalog composable API from `vue/src/components/tree-view/composables/useTreeDragDrop.ts` (options, return values, lifecycle)
- [X] T005 [P] Read TreeView.vue props, emits, provide/inject setup, and keyboard handling
- [X] T006 [P] Read TreeItem.vue injected state, drag integration, visual structure
- [X] T007 [P] Read DropIndicator.vue props and rendering logic
- [X] T008 [P] Read App.vue for real-world usage example patterns

---

## Phase 2: Document Creation

**Purpose**: Create the AI-oriented usage guide inside the component directory

- [ ] T009 Create `vue/src/components/tree-view/AI-GUIDE.md` with the following sections:

  **Section 1 — Overview**: Brief component description, tech stack (Vue 3.5+, Composition API, `<script setup>`, TypeScript, Tailwind CSS v4, Reka UI), architecture pattern (provide/inject tree, composables for shared logic, recursive TreeItem SFC)

  **Section 2 — File Structure**: Map of all files in the component directory with one-line descriptions of each file's role

  **Section 3 — Data Model**: Complete `TreeViewItem` interface with all fields documented (id, name, type, children, checked, draggable, droppable). Explain the tree structure (recursive children array, in-place mutations for drag-drop)

  **Section 4 — Component API (TreeView.vue)**: All props with types, defaults, and behavior descriptions. All emitted events with payload signatures. Slot API (icon slot, label slot). v-model:data support for drag-drop mutations

  **Section 5 — Feature Flags**: How each boolean prop enables a feature set (showCheckboxes, recursiveSelect, enableDragDrop, showExpandAll) and interactions between them

  **Section 6 — Drag & Drop**: How to enable drag-drop, the DropZone type (before/after/inside), the TreeDragDropEvent payload, how to cancel a drop via preventDefault(), per-node draggable/droppable restrictions, keyboard reordering (Alt+Arrow keys), and the composable architecture

  **Section 7 — Node Actions**: How to define per-type action buttons via TreeViewNodeActionsMap, the action callback signature, and tooltip rendering

  **Section 8 — Context Menu**: How to define menu items via TreeViewMenuItem[], action callbacks with selected items

  **Section 9 — Selection & Checkboxes**: Click selection (single, Ctrl+click, Shift+click, drag-select), checkbox state management (check-change event, recursive select mode), getCheckState utility

  **Section 10 — Injection Keys**: Complete list of injection keys from keys.ts with types and purpose — essential for any AI extending TreeItem or creating new child components

  **Section 11 — Utility Functions**: All exported functions from utils.ts with signatures and use cases (tree traversal, mutation, filtering, state computation)

  **Section 12 — Extending the Component**: Step-by-step patterns for common AI tasks:
    - Adding a new prop to TreeView
    - Adding a new event emission
    - Adding a new injection key for child component communication
    - Creating a new composable for shared logic
    - Adding a new visual element to TreeItem
    - Adding a new node-level feature (like draggable/droppable fields)

  **Section 13 — Usage Example**: Annotated code snippet from App.vue showing all features wired together (data binding, icon map, checkboxes, drag-drop, node actions, context menu, event handlers)

  **Section 14 — Common Pitfalls**: Key things an AI must know:
    - TreeView uses provide/inject (NOT props) to communicate with TreeItem
    - enableDragDrop requires `:key="String(enableDragDrop)"` for re-initialization
    - Drag-drop mutates the data array in-place, then emits update:data
    - TreeItem is recursive (renders itself for children)
    - Checkbox state computation differs based on recursiveSelect mode

---

## Phase 3: Validation

**Purpose**: Verify the document is accurate and complete

- [ ] T010 Cross-reference AI-GUIDE.md against all component source files to verify no API surface is missing (props, events, types, utilities, injection keys)
- [ ] T011 Run `pnpm type-check` and `pnpm build` to confirm no files were accidentally modified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — all reads are parallel [P]
- **Document Creation (Phase 2)**: Depends on Phase 1 — needs complete API catalog
- **Validation (Phase 3)**: Depends on Phase 2

### Parallel Opportunities

- T001–T008 can ALL run in parallel (read-only operations on different files)

---

## Notes

- Total: 11 tasks across 3 phases
- Phase 1 tasks (T001–T008) are already completed (catalog built from prior reads)
- The deliverable is a single file: `vue/src/components/tree-view/AI-GUIDE.md`
- The guide should be written in English for maximum AI compatibility
- No automated tests — manual review of document accuracy
