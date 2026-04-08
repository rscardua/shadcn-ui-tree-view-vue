# Feature Specification: Node Action Buttons

**Feature Branch**: `003-node-action-buttons`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Adicionar botoes de acao flutuantes configuraveis por tipo de no na tree view, e atualizar o exemplo usando as novas funcoes"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure action buttons per node type (Priority: P1)

As a developer using the tree view component, I want to define a map of action buttons per node type so that each type of node in the tree displays its own relevant set of quick actions.

**Why this priority**: This is the core capability of the feature. Without the ability to configure which actions appear for which node types, nothing else works.

**Independent Test**: Can be fully tested by passing a node actions configuration to the tree view and verifying that hovering over nodes of different types shows the correct buttons.

**Acceptance Scenarios**:

1. **Given** a tree view with a node actions map that defines actions for "region" and "store" types, **When** the user hovers over a "region" node, **Then** only the actions configured for "region" are displayed.
2. **Given** a tree view with a node actions map, **When** the user hovers over a node type that has no actions configured, **Then** no action buttons appear for that node.
3. **Given** a tree view with no node actions map provided, **When** the user hovers over any node, **Then** no action buttons appear (backward compatible).

---

### User Story 2 - Execute an action and receive feedback (Priority: P1)

As a developer, I want to click an action button and have both an optional callback executed and an event emitted to the parent component, so I can handle actions flexibly via either mechanism.

**Why this priority**: Actions that cannot be triggered provide no value. This is equally critical as Story 1 — buttons must be clickable and produce results.

**Independent Test**: Can be tested by clicking an action button and verifying that: (a) the direct callback fires with the correct node data, and (b) the parent component receives the emitted event with the action ID and node data.

**Acceptance Scenarios**:

1. **Given** a node action with a callback defined, **When** the user clicks the action button, **Then** the callback is invoked with the current node's data.
2. **Given** any node action (with or without callback), **When** the user clicks the action button, **Then** a `node-action` event is emitted to the parent component containing the action ID and the node data.
3. **Given** a node action button, **When** the user clicks it, **Then** the click does NOT trigger node selection or any other tree interaction (click isolation).

---

### User Story 3 - Tooltips on action buttons (Priority: P2)

As a user navigating the tree, I want to see a tooltip when hovering over an action button so I can understand what each button does before clicking.

**Why this priority**: Tooltips provide discoverability and usability, but the feature is still functional without them. Important for user experience but not for core mechanics.

**Independent Test**: Can be tested by hovering over an action button and verifying a tooltip with the configured text appears.

**Acceptance Scenarios**:

1. **Given** a node action with a tooltip text configured, **When** the user hovers over its button, **Then** a tooltip appears showing the configured text.
2. **Given** a tooltip is visible, **When** the user moves the cursor away from the button, **Then** the tooltip disappears.

---

### User Story 4 - Visual presentation and transitions (Priority: P2)

As a user, I want the action buttons to appear smoothly on hover and disappear when not hovering, so the tree remains clean and uncluttered during normal browsing.

**Why this priority**: Clean visual presentation is important for the overall UX of the tree component but is secondary to functional correctness.

**Independent Test**: Can be tested by hovering over a node row and observing that the action buttons fade in, and moving the cursor away causes them to fade out.

**Acceptance Scenarios**:

1. **Given** a tree node with configured actions, **When** the user hovers over the node row, **Then** the action buttons become visible with a smooth opacity transition.
2. **Given** visible action buttons on a hovered node, **When** the user moves the cursor away from the node row, **Then** the buttons fade out smoothly.
3. **Given** a tree view at rest (no hover), **When** the user views the tree, **Then** no action buttons are visible on any node.

---

### User Story 5 - Updated demo showcasing node actions (Priority: P3)

As a developer evaluating the tree view component, I want the demo application to showcase the node action buttons feature with realistic examples so I can understand how to integrate it in my own project.

**Why this priority**: The demo is important for adoption and developer experience, but does not affect the component's functionality.

**Independent Test**: Can be tested by running the demo app and verifying that node actions are visible on hover, clickable, and produce observable output (e.g., console logs or UI feedback).

**Acceptance Scenarios**:

1. **Given** the demo application is running, **When** the user hovers over nodes of different types, **Then** type-specific action buttons with icons appear.
2. **Given** the demo application, **When** the user clicks an action button, **Then** visible feedback is provided (e.g., console log or toast).

---

### Edge Cases

- What happens when a node type key in the actions map does not match any node in the tree? The configuration is simply unused — no error occurs.
- What happens when an action's callback throws an error? The event should still be emitted to the parent (callback and event are independent).
- What happens when the actions map is changed dynamically at runtime? The tree should reactively update which buttons appear on hover.
- How do action buttons coexist with existing hover info buttons? Both should be visible simultaneously without overlapping or interfering.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tree view component MUST accept an optional configuration that maps node types to arrays of action definitions.
- **FR-002**: Each action definition MUST include a unique identifier, an icon, and a tooltip text.
- **FR-003**: Each action definition MAY include an optional callback function that receives the node data when triggered.
- **FR-004**: Action buttons MUST only be visible when the user hovers over the node's row.
- **FR-005**: Action buttons MUST be positioned to the right side of the node row, after the node name.
- **FR-006**: Clicking an action button MUST NOT trigger node selection or expand/collapse behavior.
- **FR-007**: Clicking an action button MUST always emit an event to the parent component with the action ID and the node's data.
- **FR-008**: If the action has a callback defined, clicking it MUST also invoke the callback with the node's data.
- **FR-009**: Each action button MUST display a tooltip with the configured text on hover.
- **FR-010**: Action buttons MUST appear and disappear with a smooth opacity transition.
- **FR-011**: When no actions map is provided, the tree MUST behave identically to its current behavior (backward compatibility).
- **FR-012**: The actions configuration MUST be reactive — changes at runtime are reflected immediately.
- **FR-013**: Action buttons MUST coexist with the existing hover info feature without visual or functional conflict.

### Key Entities

- **Node Action**: A single action that can be performed on a tree node. Has a unique identifier, icon, tooltip text, and optional callback.
- **Node Actions Map**: A configuration object mapping node type strings to arrays of Node Actions. Determines which actions are available for each type of node in the tree.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of configured node types display their correct action buttons on hover.
- **SC-002**: Action buttons appear within 200ms of hovering and disappear within 200ms of leaving the node row.
- **SC-003**: Clicking an action button triggers the expected callback and event in 100% of cases, with zero unintended side effects (no accidental selection or collapse).
- **SC-004**: The demo application showcases at least 3 different node types with distinct action sets.
- **SC-005**: Existing tree view functionality (selection, checkboxes, expand/collapse, context menu, search) remains fully operational after the feature is added.
- **SC-006**: Tooltips are displayed on every action button within 300ms of hovering.

## Assumptions

- The tree view component already supports a `type` field on each node that can be used to key the actions map.
- Tooltip components (or equivalent UI primitives) are either already available in the project or can be added as part of this feature.
- The existing hover info button pattern establishes a precedent for hover-revealed controls — the new action buttons follow the same interaction model.
- Icon components are provided by the consumer (e.g., from an icon library) and passed as component references in the action configuration.
- The demo update will use the existing demo data structure and add node actions as an additive change to `App.vue`.
