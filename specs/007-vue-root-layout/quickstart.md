# Quickstart: Root Vue Workspace

**Branch**: `007-vue-root-layout` | **Date**: 2026-04-08  
**Applies after**: Feature 007 migration is complete

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.19+ or 22.12+ | Runtime |
| pnpm | 10+ | Package manager |
| Git | any | Version control |

---

## Clone and Run

```bash
git clone https://github.com/rscardua/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue
pnpm install
pnpm dev
```

The demo app starts at **http://localhost:5173**.

---

## Repository Structure (Post-Migration)

```text
shadcn-ui-tree-view-vue/
|-- .gitignore
|-- .npmrc
|-- .vscode/
|-- LICENSE
|-- README.md
|-- package.json
|-- pnpm-lock.yaml
|-- vite.config.ts
|-- tsconfig.json
|-- tsconfig.app.json
|-- tsconfig.node.json
|-- postcss.config.mjs
|-- components.json
|-- index.html
|-- env.d.ts
|-- public/
|-- src/
|   |-- App.vue
|   |-- main.ts
|   |-- assets/index.css
|   |-- components/
|   |   |-- tree-view/
|   |   `-- ui/
|   `-- lib/
|-- docs/
`-- specs/
```

---

## Available Commands

All commands run from repository root:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite dev server with HMR |
| `pnpm build` | Run type-check + production build |
| `pnpm build-only` | Build without the separate type-check step |
| `pnpm type-check` | Run `vue-tsc --build` |
| `pnpm preview` | Preview the production build locally |

---

## Reusing the Component

The source-of-truth copy path is now:

```text
src/components/tree-view/
```

Consumers should copy that directory into their target project and keep the existing `@/components/...` alias-based imports aligned with `src/`.

---

## Validation Checklist

1. Clone the repository and stay at repository root.
2. Run `pnpm install`.
3. Run `pnpm dev` and confirm the demo loads.
4. Run `pnpm type-check`.
5. Run `pnpm build`.
6. Confirm the official docs do not require `cd vue`.

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
pnpm install
pnpm type-check
```
