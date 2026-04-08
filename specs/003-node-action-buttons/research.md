# Research: Node Action Buttons

**Feature**: 003-node-action-buttons
**Date**: 2026-04-08

## R1: Tooltip Component Availability

**Decision**: Use Reka UI's built-in Tooltip primitives (`TooltipProvider`, `TooltipRoot`, `TooltipTrigger`, `TooltipContent`, `TooltipPortal`, `TooltipArrow`) wrapped in shadcn-style Vue SFCs.

**Rationale**: Reka UI (`reka-ui@^2.9.5`) already ships a full Tooltip component family. The project already depends on Reka UI for HoverCard, Dialog, Collapsible, and ContextMenu. Using Reka UI tooltips maintains consistency, adds zero new dependencies, and follows the established wrapper pattern in `components/ui/`.

**Alternatives considered**:
- Native `title` attribute: Too limited — no styling, no positioning control, inconsistent across browsers.
- Custom tooltip from scratch: Unnecessary effort when Reka UI provides a fully accessible, positioned tooltip.
- Floating UI directly: Lower-level than needed; Reka UI already wraps it.

## R2: Injection Pattern for Node Actions

**Decision**: Add two new typed `InjectionKey` symbols in `keys.ts` — one for the actions map, one for the action handler callback. Follow the exact same pattern used by `TREE_ICON_MAP`, `TREE_MENU_ITEMS`, etc.

**Rationale**: The existing codebase uses `provide`/`inject` with typed `InjectionKey` symbols for all tree-level configuration passed to `TreeItem.vue`. This is the established pattern (Constitution Principle I and II). Adding two new keys is the minimal, consistent approach.

**Alternatives considered**:
- Props drilling through TreeItem: Violates the established `provide`/`inject` pattern and would require modifying the recursive TreeItem component signature.
- Event bus / global store: Violates Constitution Principle I (no global state).

## R3: Action Button Placement in TreeItem Template

**Decision**: Insert action buttons between the node name `<span>` (or label slot) and the existing HoverCard info button, wrapped in a `div` with `ml-auto` to push them right. Use the existing `group`/`group-hover:opacity-100 opacity-0` pattern for hover visibility.

**Rationale**: The TreeItem template already uses a `group` class on the flex container and `group-hover:opacity-100 opacity-0` on the info button. The action buttons should follow the identical pattern for visual consistency. Placing them before the info button keeps the info button as the rightmost element (consistent with its current position).

**Alternatives considered**:
- After the info button: Would change the info button's position relative to the row edge.
- Absolute positioning: Unnecessary complexity when flex layout with `ml-auto` achieves the same result cleanly.

## R4: Click Isolation Strategy

**Decision**: Use `@click.stop` on each action button to prevent click propagation to the treeitem row (which triggers selection).

**Rationale**: The existing info button and checkbox already use `@click.stop` for the same reason. This is the established pattern in the codebase.

**Alternatives considered**:
- `@click.prevent`: Doesn't stop propagation to parent handlers.
- Conditional check in `handleClick`: More fragile and couples action awareness into the selection logic.

## R5: Dual Handler Pattern (Callback + Event)

**Decision**: When an action button is clicked, first invoke the optional `action` callback (if defined), then always emit the `node-action` event via the injected handler. The callback and event emission are independent — a callback error should not prevent the event.

**Rationale**: This gives consumers maximum flexibility. Some prefer inline callbacks (simple cases), others prefer centralized event handling (complex cases). Both mechanisms coexist cleanly.

**Alternatives considered**:
- Callback only: Loses the ability to handle actions centrally in the parent component.
- Event only: Forces all handling through the parent, making simple inline actions verbose.
