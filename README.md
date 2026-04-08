# Shadcn/ui Tree View (Vue)

Componente Tree View em Vue 3 para interfaces administrativas com busca, selecao avancada, checkboxes em cascata, menu de contexto e hover cards. Tecnologias principais: Vue 3, TypeScript, Reka UI e Tailwind CSS.

## Screenshot / Demo

> Placeholder: gere uma nova captura do demo Vue em `http://localhost:5173` apos a consolidacao. A imagem antiga do projeto React foi removida de proposito.

## Features

- Renderizacao de arvore com expandir e recolher por nivel
- Selecao simples, multipla, por intervalo e por drag
- Busca e filtro em tempo real
- Checkboxes em cascata com sincronizacao entre pais e filhos
- Menus de contexto por item
- Hover cards com metadados do item

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 20.19+ ou 22.12+ |
| pnpm | 10+ |

## Installation

### Option A: Development (clone + run)

```bash
git clone https://github.com/neigebaie/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue/vue
pnpm install
pnpm dev
```

O demo sobe em `http://localhost:5173`.

### Option B: Copy component (manual integration)

1. Copie `vue/src/components/tree-view/` para `src/components/tree-view/` no projeto de destino.
2. Copie ou recrie os primitives usados pelo componente em `src/components/ui/`: `badge`, `button`, `checkbox`, `collapsible`, `context-menu`, `hover-card` e `input`.
3. Copie `vue/src/lib/utils.ts` ou adapte a funcao `cn()` para a convencao do seu projeto.
4. Instale as dependencias abaixo no projeto de destino:

```bash
pnpm add @lucide/vue class-variance-authority clsx reka-ui tailwind-merge tw-animate-css
```

5. Garanta que o alias `@/` aponte para `src/`, ou ajuste os imports copiados.
6. Use um tema Tailwind/shadcn-vue compativel com os primitives acima antes de montar o Tree View.

## Component API

### Props (`TreeViewProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TreeViewItem[]` | required | Estrutura hierarquica exibida pelo componente. |
| `title` | `string \| undefined` | `undefined` | Reservado para uso futuro. |
| `showExpandAll` | `boolean` | `true` | Exibe os botoes de expandir e recolher tudo. |
| `showCheckboxes` | `boolean` | `false` | Habilita checkboxes com comportamento em cascata. |
| `searchPlaceholder` | `string` | `"Search..."` | Texto do campo de busca. |
| `selectionText` | `string` | `"selected"` | Rotulo exibido ao lado da contagem de itens selecionados. |
| `checkboxLabels` | `{ check: string; uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Customiza os botoes de marcar e desmarcar na barra de selecao. |
| `iconMap` | `TreeViewIconMap \| undefined` | `undefined` | Mapa opcional entre tipo do item e componente de icone Vue. |
| `menuItems` | `TreeViewMenuItem[] \| undefined` | `undefined` | Acoes exibidas no menu de contexto. |

### Emits (`TreeViewEmits`)

| Event | Payload | Description |
|-------|---------|-------------|
| `selection-change` | `TreeViewItem[]` | Disparado quando a selecao muda. |
| `check-change` | `TreeViewItem`, `boolean` | Disparado quando um checkbox muda de estado. |
| `action` | `string`, `TreeViewItem[]` | Disparado quando uma acao do menu de contexto e executada. |

### Slots (`TreeViewSlots`)

| Slot | Slot props | Description |
|------|------------|-------------|
| `icon` | `{ item: TreeViewItem; depth: number }` | Substitui o icone padrao de cada item. |
| `label` | `{ item: TreeViewItem }` | Substitui a renderizacao do rotulo do item. |

### Interfaces

```ts
import type { Component } from 'vue'

export interface TreeViewItem {
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
}

export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: Component
  action: (items: TreeViewItem[]) => void
}

export type TreeViewIconMap = Record<string, Component | undefined>
```

## Usage Example

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Download, File, Folder, FolderOpen, Globe } from '@lucide/vue'
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem, TreeViewMenuItem } from '@/components/tree-view/types'

const treeData = ref<TreeViewItem[]>([
  {
    id: '1',
    name: 'Brasil',
    type: 'region',
    children: [
      {
        id: '1.1',
        name: 'Loja Centro',
        type: 'store',
        children: [
          { id: '1.1.1', name: 'Catalogo', type: 'department' },
          { id: '1.1.2', name: 'Relatorio.pdf', type: 'item' },
        ],
      },
    ],
  },
])

const iconMap = {
  region: Globe,
  store: Folder,
  department: FolderOpen,
  item: File,
}

const menuItems: TreeViewMenuItem[] = [
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    action: (items) => console.log('Baixando itens', items),
  },
]

function onSelectionChange(items: TreeViewItem[]) {
  console.log('Selecionados', items)
}

function onCheckChange(item: TreeViewItem, checked: boolean) {
  console.log('Checkbox alterado', item.name, checked)
}

function onAction(action: string, items: TreeViewItem[]) {
  console.log('Acao executada', action, items)
}
</script>

<template>
  <TreeView
    :data="treeData"
    :icon-map="iconMap"
    :menu-items="menuItems"
    :show-checkboxes="true"
    :show-expand-all="true"
    search-placeholder="Buscar itens..."
    selection-text="selecionados"
    :checkbox-labels="{ check: 'Marcar', uncheck: 'Desmarcar' }"
    @selection-change="onSelectionChange"
    @check-change="onCheckChange"
    @action="onAction"
  >
    <template #label="{ item }">
      <span>{{ item.name }}</span>
    </template>
  </TreeView>
</template>
```

## Development Setup

```bash
cd vue
pnpm install
pnpm dev
pnpm build
pnpm type-check
```

## Contributing

- Use o fluxo de planejamento descrito em `specs/` para novas features.
- Trabalhe somente dentro de `vue/` para codigo de produto e demo.
- Mantenha um commit por unidade logica de mudanca.
- Antes de abrir PR, confirme que `cd vue && pnpm dev` e `cd vue && pnpm type-check` funcionam sem regressao.

## Credits

- Projeto base original: [`neigebaie/shadcn-ui-tree-view`](https://github.com/neigebaie/shadcn-ui-tree-view).
- Esta versao em Vue foi convertida com apoio de IA e segue com continuidade de manutencao neste fork pelos mantenedores atuais.
