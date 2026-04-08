# Quickstart: Vue 3 Tree View

**Branch**: `001-vue3-migration` | **Date**: 2026-04-08

## Prerequisites

- Node.js 18+
- pnpm

## Setup

```bash
cd vue/
pnpm install
pnpm dev
```

The demo app runs at `http://localhost:5173`.

## Project Structure

```
vue/
├── src/
│   ├── App.vue                    # Demo application
│   ├── main.ts                    # App entry point
│   ├── assets/
│   │   └── index.css              # Tailwind CSS entry + theme
│   ├── components/
│   │   ├── tree-view/
│   │   │   ├── TreeView.vue       # Main tree view component
│   │   │   ├── TreeItem.vue       # Recursive tree item component
│   │   │   ├── types.ts           # TypeScript interfaces
│   │   │   ├── keys.ts            # Provide/inject InjectionKey symbols
│   │   │   ├── composables/
│   │   │   │   ├── useTreeSelection.ts   # Selection logic
│   │   │   │   ├── useTreeSearch.ts      # Search/filter logic
│   │   │   │   ├── useTreeCheckbox.ts    # Checkbox cascade logic
│   │   │   │   ├── useTreeKeyboard.ts    # Keyboard navigation
│   │   │   │   └── useTreeDragSelect.ts  # Drag-select logic
│   │   │   └── utils.ts           # Helper functions (buildItemMap, etc.)
│   │   └── ui/                    # shadcn-vue components
│   │       ├── badge/
│   │       ├── button/
│   │       ├── checkbox/
│   │       ├── collapsible/
│   │       ├── context-menu/
│   │       ├── dialog/
│   │       ├── hover-card/
│   │       ├── input/
│   │       └── scroll-area/
│   └── lib/
│       ├── utils.ts               # cn() utility
│       └── demo-data.ts           # Sample tree data
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
└── components.json                # shadcn-vue config
```

## Adding the TreeView to Your App

```vue
<script setup lang="ts">
import { TreeView } from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem } from '@/components/tree-view/types'
import { Folder, File } from '@lucide/vue'

const data: TreeViewItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    children: [
      { id: '1.1', name: 'Report.pdf', type: 'file' },
      { id: '1.2', name: 'Notes.txt', type: 'file' },
    ],
  },
]

const iconMap = {
  folder: Folder,
  file: File,
}

function onSelectionChange(items: TreeViewItem[]) {
  console.log('Selected:', items)
}
</script>

<template>
  <TreeView
    :data="data"
    :icon-map="iconMap"
    :show-checkboxes="true"
    @selection-change="onSelectionChange"
  />
</template>
```

## Verification Checklist

- [ ] `pnpm dev` starts without errors
- [ ] Tree renders with sample data
- [ ] Folders expand/collapse with smooth animation
- [ ] Click selection works (single, Ctrl, Shift, drag)
- [ ] Search filters the tree and auto-expands matches
- [ ] Checkboxes cascade correctly (parent ↔ children)
- [ ] Right-click context menu shows configured actions
- [ ] Hover card shows item details on info icon hover
- [ ] Keyboard navigation works (arrows, Enter, Space, Home, End)
- [ ] Selected count badges appear on collapsed folders
