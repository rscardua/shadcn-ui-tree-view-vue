# Research: Vue 3 Migration

**Branch**: `001-vue3-migration` | **Date**: 2026-04-08

## Technology Decisions

### 1. UI Primitive Library

**Decision**: Reka UI (`reka-ui`) v2.x
**Rationale**: Radix Vue has been renamed to Reka UI for v2. It provides all needed components (Checkbox, Collapsible, Context Menu, Hover Card, Dialog, Scroll Area) and notably includes a Tree primitive. 2.9M+ monthly downloads, actively maintained.
**Alternatives considered**:
- `radix-vue` v1.x — legacy/maintenance mode, superseded by Reka UI
- Headless UI — fewer components, missing context menu and hover card
- Building from scratch — unnecessary when battle-tested primitives exist

### 2. Icon Library

**Decision**: `@lucide/vue` v1.x (renamed from `lucide-vue-next`)
**Rationale**: Direct Vue 3 equivalent of `lucide-react`. Tree-shakable, TypeScript support, same icon set. The package was renamed in Lucide v1.
**Alternatives considered**:
- `lucide-vue-next` — legacy name, same package
- Heroicons — different icon set, would change visual appearance

### 3. Component Framework (shadcn-vue)

**Decision**: `shadcn-vue` v2.x for UI component scaffolding
**Rationale**: Official Vue port of shadcn/ui. Built on Reka UI. Copies component source into project (same ownership model as React shadcn/ui). Provides Badge, Button, Checkbox, Collapsible, Context Menu, Dialog, Hover Card, Input, Scroll Area — all components needed. Uses Tailwind CSS.
**Alternatives considered**:
- Port shadcn/ui components manually — unnecessary duplication of work
- Vuetify / Quasar — too opinionated, different styling system

### 4. Animation Approach

**Decision**: Reka UI Collapsible CSS variables + Vue `<Transition>` + CSS transitions
**Rationale**: Reka UI's Collapsible provides `--reka-collapsible-content-height` CSS variable for smooth height animations. Vue's built-in `<Transition>` handles enter/leave animations. No additional animation library needed. The React version uses very fast animations (50-100ms) that are easily achievable with CSS transitions.
**Alternatives considered**:
- `@vueuse/motion` — Framer Motion-like API but adds bundle size for simple transitions
- GSAP — overkill for expand/collapse and fade animations
- CSS `grid-template-rows` trick — works but Reka UI's approach is more robust

### 5. Build Tool

**Decision**: Vite (latest)
**Rationale**: Recommended build tool for Vue 3. Fast HMR, native TypeScript support, used by shadcn-vue scaffolding.
**Alternatives considered**:
- Nuxt — adds SSR complexity not needed for a component library demo
- Webpack — slower, less Vue 3 ecosystem alignment

### 6. Tailwind CSS Version

**Decision**: Tailwind CSS v4.x with `@tailwindcss/vite` plugin
**Rationale**: shadcn-vue v2.x uses Tailwind v4. Configuration moves to CSS `@theme` directives instead of `tailwind.config.js`. The Vite plugin eliminates PostCSS config.
**Alternatives considered**:
- Tailwind v3 — would work but shadcn-vue scaffolding defaults to v4

### 7. State Management Architecture

**Decision**: Composables + `provide`/`inject` (no external state library)
**Rationale**: The tree view's state (expanded IDs, selected IDs, search query, drag state) is component-local. Vue's `provide`/`inject` with typed `InjectionKey` symbols avoids prop drilling through recursive TreeItem components. No global state needed.
**Alternatives considered**:
- Pinia — overkill for component-scoped state
- Props-only — causes excessive prop drilling in recursive components

### 8. Recursive Component Strategy

**Decision**: Named SFC with self-referencing via component name
**Rationale**: Vue 3 SFCs with `<script setup>` can self-reference by their filename. A `TreeItem.vue` component can use `<TreeItem>` in its own template. Shared state accessed via `inject()`.
**Alternatives considered**:
- Render functions — loses SFC benefits, harder to read
- Flat rendering with virtual tree — more complex, premature optimization

### 9. Keyboard Navigation / Focus Management

**Decision**: Custom composable implementing roving tabindex pattern
**Rationale**: WAI-ARIA Treeview requires roving tabindex (single tab stop, arrow keys move focus). Reka UI's Tree primitive may provide this, but we need full control for custom selection/checkbox interactions. A `useTreeKeyboard` composable encapsulates all keyboard handling.
**Alternatives considered**:
- Reka UI Tree primitive's built-in keyboard — may conflict with custom selection logic
- `@vueuse/core` `useFocusTrap` — designed for modals, not tree navigation

## Resolved Clarifications

All NEEDS CLARIFICATION items from the spec have been resolved through the clarification session and this research:

- **UI primitives**: Reka UI (via shadcn-vue)
- **Animation library**: No external library needed — CSS transitions + Vue `<Transition>`
- **Build tool**: Vite with Tailwind v4
- **Project structure**: `vue/` directory at repo root, independent setup
- **Keyboard navigation**: Custom composable with roving tabindex
