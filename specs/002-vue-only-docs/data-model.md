# Data Model: Consolidar Projeto de Interface

**Branch**: `002-vue-only-docs` | **Date**: 2026-04-08

---

## Overview

This is a repository consolidation feature. The "data model" describes file artifacts — their current state, target state, and the transformation required.

---

## Entity: Repository Root

### Current State (Two Projects)

```
d:\projects\shadcn-ui-tree-view-vue\
├── .gitignore                 # React/Next.js patterns
├── .git/                      # Git repository
├── app/                       # ❌ Next.js app directory
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                # ❌ React components
│   ├── tree-view.tsx          # React tree view (main component)
│   └── ui/                    # shadcn/ui React components
│       ├── badge.tsx | button.tsx | checkbox.tsx | collapsible.tsx
│       ├── context-menu.tsx | dialog.tsx | hover-card.tsx
│       ├── input.tsx | scroll-area.tsx
├── lib/                       # ❌ React utilities
│   ├── demo_data.ts
│   └── utils.ts
├── public/                    # ❌ Next.js favicon assets
│   ├── android-chrome-192x192.png | android-chrome-512x512.png
│   ├── apple-touch-icon.png | favicon-16x16.png | favicon-32x32.png
│   ├── favicon.ico | site.webmanifest
├── scripts/                   # ❌ React-specific schema generator
│   └── create-schema.js
├── specs/                     # ✅ Feature planning docs (unchanged)
├── vue/                       # ✅ Vue project (unchanged)
├── CLAUDE.md                  # ⚠️ Needs update (wrong paths/commands)
├── components.json            # ❌ shadcn/ui React config
├── eslint.config.mjs          # ❌ Next.js ESLint config
├── LICENSE                    # ✅ Unchanged
├── next.config.ts             # ❌ Next.js config
├── package.json               # ❌ React/Next.js root package
├── pnpm-lock.yaml             # ❌ React/Next.js lockfile
├── postcss.config.mjs         # ❌ Next.js PostCSS config
├── README.md                  # ⚠️ Needs complete rewrite (React docs)
├── screenshot.png             # ❌ React app screenshot
├── tailwind.config.ts         # ❌ React/Next.js Tailwind config
└── tsconfig.json              # ❌ React/Next.js TypeScript config
```

### Target State (Vue Only)

```
d:\projects\shadcn-ui-tree-view-vue\
├── .gitignore                 # ✏️ Updated: Vite/Vue patterns, simplified
├── .git/                      # Git repository (unchanged)
├── specs/                     # ✅ Feature planning docs (unchanged)
├── vue/                       # ✅ Vue project (unchanged)
├── CLAUDE.md                  # ✏️ Updated: correct paths and pnpm commands
├── LICENSE                    # ✅ Unchanged
└── README.md                  # ✏️ Rewritten: Vue component library docs
```

---

## Entity: `.gitignore`

| Field | Value |
|-------|-------|
| **Action** | Update |
| **Remove** | `/.next/`, `/out/`, `/coverage`, `/build`, root-scoped `/node_modules` |
| **Add** | `vue/dist/`, `vue/.vite/` |
| **Retain** | `.DS_Store`, `*.pem`, debug log patterns |

### Validation Rule
After update, no entry in `.gitignore` should reference a path or pattern exclusively associated with Next.js or React.

---

## Entity: `README.md`

| Field | Value |
|-------|-------|
| **Action** | Complete rewrite |
| **Old content** | React JSX API docs, framer-motion install, Radix React deps, `npx shadcn@latest` instructions |
| **New content** | Vue component library overview, pnpm install, Vue component API (Props/Emits/Slots), usage example in Vue SFC syntax |

### Required Sections (contract — see `contracts/readme-structure.md`)
1. Project headline + description
2. Features list
3. Requirements (Node.js, pnpm)
4. Installation
5. Component API (Props, Emits, Slots, TreeViewItem interface)
6. Usage Example (Vue SFC)
7. Development Setup
8. Contributing

### Validation Rules
- No JSX syntax
- No React-specific imports (`import { TreeView } from "@/components/tree-view"`)
- No `framer-motion`, `@radix-ui/react-*`, or `lucide-react` references
- All code examples use `.vue` SFC syntax

---

## Entity: `CLAUDE.md`

| Field | Value |
|-------|-------|
| **Action** | Targeted update |
| **Section: Project Structure** | Replace `src/` and `tests/` with actual Vue paths (`vue/src/`, `vue/src/components/tree-view/`) |
| **Section: Commands** | Replace `npm test; npm run lint` with `cd vue && pnpm dev` (dev), `cd vue && pnpm build` (build), `cd vue && vue-tsc --build` (type-check) |

### Validation Rule
All paths referenced in CLAUDE.md must exist in the repository after consolidation.

---

## Entity: Removed File Set

| Path | Type | Reason |
|------|------|--------|
| `app/` | Directory | Next.js app |
| `components/` | Directory | React components |
| `lib/` | Directory | React utils |
| `public/` | Directory | Next.js public assets |
| `scripts/` | Directory | Contains only the broken React schema generator |
| `components.json` | File | shadcn/ui React config |
| `eslint.config.mjs` | File | Next.js ESLint config |
| `next.config.ts` | File | Next.js config |
| `package.json` | File | React/Next.js root package |
| `pnpm-lock.yaml` | File | React/Next.js lockfile |
| `postcss.config.mjs` | File | Next.js PostCSS config |
| `screenshot.png` | File | React app screenshot |
| `tailwind.config.ts` | File | React Tailwind config |
| `tsconfig.json` | File | React TypeScript config |

### Validation Rule
After removal, `git status` must show all removed paths as deleted. No removed path should be referenced by any retained file.

---

## Entity: Constitution

| Field | Value |
|-------|-------|
| **Action** | Amendment |
| **Section** | Development Workflow — Coexistence |
| **Old text** | "The existing React/Next.js code MUST remain untouched in its current location. Vue code lives exclusively under `vue/`." |
| **New text** | "Vue code lives under `vue/`. The React/Next.js implementation has been retired (feature 002). There is no coexistence requirement." |

### Validation Rule
No principle in the constitution may reference the React project as active or protected after this amendment.

---

## State Transitions

```
PRE-CONSOLIDATION                     POST-CONSOLIDATION
──────────────────                    ──────────────────
Root: two projects                →   Root: Vue-only + docs
React/Next.js at root             →   Removed
Vue at vue/                       →   Vue at vue/ (unchanged)
README = React docs               →   README = Vue docs
CLAUDE.md = wrong paths           →   CLAUDE.md = correct paths
.gitignore = Next.js patterns     →   .gitignore = Vite patterns
Constitution: coexistence rule    →   Constitution: Vue-only rule
```
