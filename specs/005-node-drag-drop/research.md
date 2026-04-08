# Research: Drag and Drop de Nós na Tree View

**Feature**: 005-node-drag-drop  
**Date**: 2026-04-08

## R1: HTML5 Drag and Drop API vs. Pointer Events

**Decision**: Use HTML5 Drag and Drop API as the primary mechanism.

**Rationale**: The HTML5 DnD API provides native browser support for drag operations including `dataTransfer`, automatic cursor changes, and cross-element drag tracking. It is the standard approach for tree drag-drop in desktop-focused components. The existing codebase already uses mouse events for drag-select, so the DnD API provides clear separation between "drag to select" and "drag to move" behaviors.

**Alternatives considered**:
- **Pointer Events + manual state**: More control but requires reimplementing drag preview, cursor management, and scroll behavior. Significantly more code for the same result.
- **Third-party library (vuedraggable/sortablejs)**: Adds a dependency for functionality achievable with native APIs. Against constitution principle of minimal dependencies.

## R2: Drop Zone Detection Strategy

**Decision**: Divide each TreeItem's vertical space into 3 zones: top 25% (before), middle 50% (inside/reparent), bottom 25% (after).

**Rationale**: This is the industry-standard approach used by VS Code, Finder, and most file tree implementations. The proportions give enough target area for the "inside" zone (reparenting) while making before/after reordering accessible. For leaf nodes (no children), the zones become: top 33% (before), middle 33% (inside — converts leaf to parent), bottom 33% (after).

**Alternatives considered**:
- **50/50 split (before/after only)**: Doesn't support reparenting, which is a P2 requirement.
- **Equal thirds**: Less intuitive — the center "inside" zone is the most common intent when dragging over a folder.

## R3: State Management for Drag Operations

**Decision**: Create a `useTreeDragDrop` composable that encapsulates all drag state and exposes it via provide/inject to TreeItem components.

**Rationale**: Follows Constitution Principle II (shared logic in composables). Keeps TreeView.vue from growing further (already ~520 lines). The composable manages: `draggedIds`, `dropTargetId`, `dropZone`, `isDragging`. These are provided to TreeItem via new injection keys.

**Alternatives considered**:
- **Inline in TreeView.vue**: Would bloat the already large file. Harder to test in isolation.
- **Event-only approach (no shared state)**: Drop indicators need to know drag state to render; events alone are insufficient for visual feedback.

## R4: Tree Mutation Strategy

**Decision**: Mutate the `data` prop's reactive array in-place using splice operations. Emit `update:data` for v-model support and a `drop` event for the cancelable drop notification.

**Rationale**: The TreeView currently receives `data` as a prop and doesn't mutate it. For drag-drop, the tree structure must change. Using v-model pattern (`update:data`) follows Vue conventions and gives the consumer control. The cancelable `drop` event fires before mutation — if the consumer prevents it, no mutation occurs.

**Alternatives considered**:
- **Emit only, consumer mutates**: Poor DX — consumer would need to implement complex tree mutation logic themselves.
- **Deep clone + replace**: Expensive for large trees (1000+ nodes). In-place splice is O(n) for the affected siblings array only.

## R5: Circular Reference Prevention

**Decision**: Before executing a drop, traverse the ancestor chain of the drop target to verify the dragged node is not an ancestor. Use the existing `getAllDescendantIds()` utility.

**Rationale**: `getAllDescendantIds()` already exists in utils.ts and returns all descendant IDs for a given node. Checking `if (getAllDescendantIds(draggedNode).has(dropTargetId))` is O(n) in subtree size and catches all circular cases.

**Alternatives considered**:
- **Ancestor traversal from target upward**: Also valid but requires parent pointers not currently stored. Using descendants is simpler with existing utilities.

## R6: Multi-Node Drag Strategy

**Decision**: When dragging a selected node, move all selected nodes. Filter out nodes whose ancestors are also selected (to avoid duplicates). Maintain relative order.

**Rationale**: This matches user expectations from file managers (Finder, Explorer). The existing `selectedIds` set provides the selection state. The `findAncestors()` utility helps filter nested selections.

**Alternatives considered**:
- **Drag only the clicked node**: Ignores multi-select, which is a P3 requirement.
- **Custom drag handle for multi-drag**: Adds UI complexity without benefit since selection state already indicates intent.

## R7: Keyboard Reordering

**Decision**: Use Alt+ArrowUp/Down to move the focused node up/down within siblings. Use Alt+ArrowLeft to promote (move to parent's level). Use Alt+ArrowRight to demote (move into previous sibling as last child).

**Rationale**: This follows the WAI-ARIA Treeview pattern for reorderable trees and matches the keybindings used by VS Code's outline view. It doesn't conflict with existing keyboard navigation (plain Arrow keys for focus movement).

**Alternatives considered**:
- **Ctrl+Arrow**: Conflicts with text selection patterns in some OS contexts.
- **Dedicated "move mode"**: Adds cognitive overhead; modifier key approach is more discoverable.

## R8: Auto-Scroll During Drag

**Decision**: Use the scroll-area container's boundary detection. When the drag position is within 40px of the top or bottom edge, scroll at a rate proportional to proximity (faster near the edge).

**Rationale**: Native HTML5 DnD provides some auto-scroll but it's inconsistent across browsers. A custom implementation using `requestAnimationFrame` during `dragover` ensures consistent behavior. The 40px threshold and proportional speed are standard values used in major tree implementations.

**Alternatives considered**:
- **Browser native auto-scroll only**: Inconsistent across browsers, doesn't work well inside custom scroll containers (Reka UI ScrollArea).
- **Fixed scroll speed**: Jarring UX compared to proportional speed.

## R9: Interaction with Existing Drag-Select

**Decision**: Distinguish drag-to-select from drag-to-move by requiring `draggable` attribute on the node. When `enableDragDrop` is true, clicking and dragging a node initiates a move (HTML5 DnD). When `enableDragDrop` is false (default), the existing drag-select behavior is preserved.

**Rationale**: Both features use mouse drag gestures, so they must be disambiguated. The HTML5 `draggable` attribute naturally intercepts the drag gesture before the mousedown/mousemove chain used by drag-select. When DnD is enabled, drag-select on items is disabled; drag-select on empty areas could optionally remain.

**Alternatives considered**:
- **Modifier key to switch modes**: Adds hidden complexity; users wouldn't discover it.
- **Drag handle icon**: Viable but adds visual clutter to every node. Could be offered as an optional slot in future.
