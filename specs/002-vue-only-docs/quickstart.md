# Quickstart: Vue-Only Repository

**Branch**: `002-vue-only-docs` | **Date**: 2026-04-08  
**Applies after**: Feature 002 consolidation is complete (React project removed)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| pnpm | 8+ | Package manager |
| Git | any | Version control |

---

## Clone and Run

```bash
git clone https://github.com/neigebaie/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue/vue
pnpm install
pnpm dev
```

The demo app starts at **http://localhost:5173**.

---

## Repository Structure (Post-Consolidation)

```
shadcn-ui-tree-view-vue/
├── .gitignore             # Vite-oriented ignore rules
├── LICENSE
├── README.md              # Project overview, API docs, install guide
├── specs/                 # Feature planning docs (not shipped)
│   ├── 001-vue3-migration/
│   └── 002-vue-only-docs/
└── vue/                   # The component library and demo app
    ├── package.json       # Vue project dependencies
    ├── vite.config.ts     # Vite configuration
    ├── tsconfig.json
    └── src/
        ├── App.vue                        # Demo application
        ├── main.ts
        ├── assets/index.css              # Tailwind CSS entry + theme
        ├── components/
        │   ├── tree-view/               # The tree view component
        │   │   ├── TreeView.vue         # Root component (public API)
        │   │   ├── TreeItem.vue         # Recursive item
        │   │   ├── types.ts             # TreeViewItem, TreeViewMenuItem, etc.
        │   │   ├── keys.ts              # InjectionKey symbols
        │   │   ├── utils.ts             # Helper functions
        │   │   └── composables/
        │   │       ├── useTreeSelection.ts
        │   │       ├── useTreeSearch.ts
        │   │       ├── useTreeCheckbox.ts
        │   │       ├── useTreeKeyboard.ts
        │   │       └── useTreeDragSelect.ts
        │   └── ui/                      # shadcn-vue primitives
        └── lib/
            ├── demo-data.ts
            └── utils.ts
```

---

## Available Commands

All commands run from the `vue/` directory:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check + production build to `vue/dist/` |
| `pnpm build-only` | Production build without type-check |
| `pnpm type-check` | Run `vue-tsc` for TypeScript validation |
| `pnpm preview` | Preview the production build locally |

---

## Adding a Feature

1. Create a feature spec under `specs/NNN-feature-name/`
2. Run the feature planning workflow (`.specify/` tooling)
3. Work exclusively in `vue/src/`
4. Verify the demo app renders correctly at `http://localhost:5173`
5. Commit each logical unit independently

---

## Key Technologies

| Technology | Version | Role |
|------------|---------|------|
| Vue 3 | 3.5+ | Component framework |
| TypeScript | 5.x (strict) | Language |
| Vite | 6+ | Build tool + dev server |
| Reka UI | 2.x | Headless primitives |
| Tailwind CSS | 4.x | Utility-first styling |
| `@lucide/vue` | 1.x | Icon components |
| pnpm | 8+ | Package manager |

---

## Troubleshooting

**`pnpm: command not found`**
```bash
npm install -g pnpm
```

**Port 5173 already in use**
```bash
pnpm dev --port 5174
```

**Type errors after pulling**
```bash
cd vue && pnpm install && pnpm type-check
```
