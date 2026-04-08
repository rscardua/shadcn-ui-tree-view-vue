<!--
Sync Impact Report
===========================
Version change: N/A → 1.0.0 (initial ratification)
Modified principles: N/A (first version)
Added sections:
  - Core Principles (5 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md — ✅ compatible (no changes needed)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure aligns)
Follow-up TODOs: None
-->

# shadcn-ui-tree-view-vue Constitution

## Core Principles

### I. Component-First

Every feature MUST be delivered as a reusable, self-contained Vue 3
Single File Component (SFC). Components MUST be independently importable,
configurable via props/slots/events, and usable without requiring the
demo application or any specific parent layout.

- Each component MUST have a single, clear responsibility.
- Components MUST NOT depend on global state or app-level configuration
  to function correctly (use `provide`/`inject` with sensible defaults).
- Shared logic MUST be extracted into composables, not utility mixins
  or global plugins.

### II. Vue 3 Idioms (NON-NEGOTIABLE)

All Vue code MUST follow current Vue 3 best practices as documented at
vuejs.org. This is the foundational quality bar for the project.

- MUST use `<script setup lang="ts">` syntax exclusively.
- MUST use type-based `defineProps<T>()` and `defineEmits<T>()` — never
  runtime declaration with `PropType`.
- MUST use `ref`, `computed`, and `watch` from Composition API — never
  Options API (`data`, `methods`, `computed` as object).
- MUST use `provide`/`inject` with typed `InjectionKey` symbols to
  avoid prop drilling in deeply nested tree components.
- MUST NOT use `this` anywhere; the Composition API eliminates it.

### III. Accessibility (NON-NEGOTIABLE)

The tree view component MUST implement the WAI-ARIA Treeview pattern
in full. Accessibility is not optional and MUST NOT be deferred to a
later phase or treated as a polish task.

- MUST assign correct ARIA roles: `role="tree"`, `role="treeitem"`,
  `role="group"` for child containers.
- MUST manage `aria-expanded`, `aria-selected`, `aria-checked`,
  and `tabindex` attributes programmatically.
- MUST support keyboard navigation: Arrow Up/Down (focus movement),
  Arrow Right/Left (expand/collapse), Enter/Space (select/activate),
  Home/End (first/last visible node).
- Focus management MUST use roving tabindex pattern (single tab stop
  for the tree, arrow keys move focus within).

### IV. Slot-Based Extensibility

The component MUST use Vue's slot system as the primary extensibility
mechanism, following Vue community conventions rather than porting
React patterns (render props, HOCs) directly.

- MUST expose scoped slots for icon and item label customization at
  minimum, passing item data and depth as slot props.
- Prop-based configuration (icon map, menu items) MUST remain
  available as the default path — slots override props when both
  are provided.
- Slot APIs MUST be documented with their available slot props
  in the component's TypeScript interface.

### V. Feature Parity

The Vue 3 implementation MUST maintain complete functional parity
with the existing React implementation. No feature may be dropped
or reduced in capability during migration.

- All six feature areas MUST be preserved: tree rendering,
  selection (single/multi/range/drag), search/filter, checkboxes
  with cascade, context menus, and hover cards.
- Visual behavior (animations, transitions, styling) MUST match
  the React version's user experience.
- The component API (props, events, slots) MUST follow Vue
  conventions but cover the same configuration surface.

## Technology Standards

- **Framework**: Vue 3.5+ with Composition API
- **Language**: TypeScript in strict mode (`strict: true`)
- **Build tool**: Vite (replaces Next.js)
- **Styling**: Tailwind CSS (framework-agnostic, carried over)
- **UI primitives**: Radix Vue / Reka UI (replaces Radix React)
- **Animations**: Vue built-in `<Transition>` / `<TransitionGroup>`,
  supplemented by CSS transitions or a Vue animation library if needed
- **Icons**: Lucide Vue (replaces Lucide React)
- **Package manager**: pnpm (carried over)
- **Project location**: `vue/` directory at repository root with its
  own `package.json`, `vite.config.ts`, and `tsconfig.json`,
  independent from the existing React code

Dependencies MUST be kept minimal. Every added dependency MUST
directly serve a component feature — no utility-only or convenience
packages without clear justification.

## Development Workflow

- **Coexistence**: The existing React/Next.js code MUST remain
  untouched in its current location. Vue code lives exclusively
  under `vue/`.
- **Component structure**: Follow the shadcn/ui pattern —
  headless primitives composed into styled components, each in
  its own SFC file.
- **Demo application**: A Vite + Vue 3 app (not Nuxt) under
  `vue/` that showcases all tree view features with sample data.
- **Commits**: Each logical unit of work (single component,
  single feature area) MUST be committed independently.
- **Quality gate**: Before a feature is considered complete,
  it MUST render correctly in the demo app and all acceptance
  scenarios from the spec MUST be manually verifiable.

## Governance

This constitution is the authoritative source for project standards.
All implementation decisions, code reviews, and plan validations
MUST reference these principles.

- **Amendments**: Any change to principles MUST be documented with
  rationale, versioned, and reflected in dependent templates.
- **Versioning**: Constitution follows semantic versioning —
  MAJOR for principle removals/redefinitions, MINOR for additions
  or material expansions, PATCH for clarifications.
- **Compliance**: The plan's Constitution Check section MUST
  verify alignment with all five core principles before
  implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
