# Shadcn/ui Tree View (Vue)

Componente Tree View em Vue 3 para interfaces administrativas, com busca, selecao avancada, checkboxes com quatro modos de propagacao, menu de contexto, hover cards e drag and drop.

Este repositorio nao publica um pacote npm. O fluxo recomendado e o mesmo do `shadcn-vue`: copiar os arquivos do componente para o seu projeto e importar de `@/components/...`.

## Recursos

- Arvore com expandir e recolher por nivel
- Selecao simples, multipla, por intervalo e por arraste
- Busca e filtro em tempo real
- Checkboxes com modos `independent`, `top-down`, `bottom-up` e `recursive`
- Menu de contexto por item
- Hover cards com metadados do item
- Drag and drop com suporte a reordenacao e reparenting

## Requisitos

| Requisito | Versao |
|-----------|--------|
| Node.js | 20.19+ ou 22.12+ |
| pnpm | 10+ |

## Desenvolvimento local

```bash
git clone https://github.com/rscardua/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue
pnpm install
pnpm dev
```

O demo fica disponivel em `http://localhost:5173`.

## Usar em outro projeto

### Modelo de distribuicao

Use este componente como os componentes do `shadcn-vue`: copie os arquivos fonte para dentro do seu app e importe localmente.

### 1. Adicione com degit

Forma recomendada:

```bash
npx degit rscardua/shadcn-ui-tree-view-vue/src/components/tree-view src/components/ui/tree-view
```

Se preferir, voce tambem pode copiar essa mesma pasta manualmente para o projeto de destino.

Estrutura esperada no projeto consumidor:

```text
src/
  components/
    ui/
      tree-view/
        composables/
          useTreeDragDrop.ts
        DropIndicator.vue
        keys.ts
        TreeItem.vue
        TreeView.vue
        types.ts
        utils.ts
```

### 2. Garanta as dependencias de UI

O Tree View usa componentes base no estilo `shadcn-vue`. Se o seu projeto ja usa `shadcn-vue`, confira se estes componentes existem:

- `src/components/ui/badge`
- `src/components/ui/button`
- `src/components/ui/checkbox`
- `src/components/ui/collapsible`
- `src/components/ui/context-menu`
- `src/components/ui/hover-card`
- `src/components/ui/input`
- `src/components/ui/tooltip`

Tambem e necessario ter `src/lib/utils.ts` com a funcao `cn()`.

### 3. Instale as dependencias

No projeto de destino:

```bash
pnpm add vue reka-ui @lucide/vue class-variance-authority clsx tailwind-merge tw-animate-css
```

### 4. Ajuste alias e estilos

- Garanta que o alias `@/` aponte para `src/`
- Mantenha o setup de Tailwind e do tema `shadcn-vue` no projeto
- Se nao usar alias `@/`, ajuste os imports copiados

### 5. Importe o componente

Se voce usou o comando com destino em `src/components/ui/tree-view`, os imports ficam assim:

```ts
import TreeView from '@/components/ui/tree-view/TreeView.vue'
import type {
  SelectionMode,
  TreeViewItem,
  TreeViewMenuItem,
  TreeViewNodeActionsMap,
} from '@/components/ui/tree-view/types'
```

Se preferir mover a pasta para outro lugar, ajuste apenas o caminho do import.

## Exemplo de integracao

Este exemplo mostra o fluxo esperado em outro projeto: manter os dados no estado do app e apenas aplicar cada evento `check-change` emitido pelo componente.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Eye, File, Folder, FolderOpen, Globe, Pencil } from '@lucide/vue'
import TreeView from '@/components/ui/tree-view/TreeView.vue'
import type {
  SelectionMode,
  TreeViewItem,
  TreeViewNodeActionsMap,
} from '@/components/ui/tree-view/types'

const mode = ref<SelectionMode>('recursive')

const treeData = ref<TreeViewItem[]>([
  {
    id: 'docs',
    name: 'Documents',
    type: 'region',
    children: [
      {
        id: 'reports',
        name: 'Reports',
        type: 'store',
        children: [
          { id: 'q1', name: 'Q1.pdf', type: 'item' },
          { id: 'q2', name: 'Q2.pdf', type: 'item' },
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

const nodeActions: TreeViewNodeActionsMap = {
  store: [
    { id: 'view', icon: Eye, tooltip: 'View folder' },
    { id: 'rename', icon: Pencil, tooltip: 'Rename folder' },
  ],
}

function updateChecked(items: TreeViewItem[], targetId: string, checked: boolean): TreeViewItem[] {
  return items.map((item) => {
    if (item.id === targetId) {
      return { ...item, checked }
    }

    if (item.children) {
      return {
        ...item,
        children: updateChecked(item.children, targetId, checked),
      }
    }

    return item
  })
}

function handleCheckChange(item: TreeViewItem, checked: boolean) {
  treeData.value = updateChecked(treeData.value, item.id, checked)
}
</script>

<template>
  <TreeView
    :data="treeData"
    :mode="mode"
    :icon-map="iconMap"
    :node-actions="nodeActions"
    :show-checkboxes="true"
    :show-expand-all="true"
    :enable-selection="true"
    @check-change="handleCheckChange"
  />
</template>
```

## Modos de checkbox

| Valor | Comportamento |
|-------|----------------|
| `independent` | Cada checkbox altera apenas o proprio no |
| `top-down` | Marcar um pai propaga para todos os descendentes |
| `bottom-up` | Os filhos influenciam os ancestrais, sem propagar para baixo |
| `recursive` | Combina `top-down` e `bottom-up` |

## API do componente

### Props

| Propriedade | Tipo | Padrao | Descricao |
|-------------|------|--------|-----------|
| `data` | `TreeViewItem[]` | obrigatorio | Estrutura hierarquica exibida pelo componente |
| `showExpandAll` | `boolean` | `true` | Exibe os botoes de expandir e recolher tudo |
| `showCheckboxes` | `boolean` | `false` | Habilita checkboxes nos nos |
| `mode` | `SelectionMode` | `'independent'` | Define a estrategia de propagacao dos checkboxes |
| `enableSelection` | `boolean` | `false` | Habilita selecao visual por clique, Ctrl, Shift e drag |
| `enableDragDrop` | `boolean` | `false` | Habilita drag and drop |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder do campo de busca |
| `selectionText` | `string` | `'selected'` | Rotulo exibido na barra de selecao |
| `checkboxLabels` | `{ check: string; uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Personaliza os botoes da barra de selecao |
| `iconMap` | `TreeViewIconMap` | `undefined` | Mapeia `type` para icones |
| `menuItems` | `TreeViewMenuItem[]` | `undefined` | Itens do menu de contexto |
| `nodeActions` | `TreeViewNodeActionsMap` | `undefined` | Acoes por tipo de no |

### Eventos

| Evento | Payload | Descricao |
|--------|---------|-----------|
| `selection-change` | `TreeViewItem[]` | Disparado quando a selecao visual muda |
| `check-change` | `item: TreeViewItem`, `checked: boolean` | Disparado para cada no afetado por uma alteracao de checkbox |
| `node-action` | `actionId: string`, `item: TreeViewItem` | Disparado quando uma acao de no e clicada |
| `drop` | `TreeDragDropEvent` | Disparado ao concluir um drop |
| `update:data` | `TreeViewItem[]` | Emite a arvore reordenada em operacoes de drag and drop |

### Slots

| Slot | Props | Descricao |
|------|-------|-----------|
| `icon` | `{ item: TreeViewItem; depth: number }` | Substitui o icone padrao |
| `label` | `{ item: TreeViewItem }` | Substitui o rotulo do item |

### Tipos principais

```ts
import type { Component } from 'vue'

export type SelectionMode =
  | 'independent'
  | 'top-down'
  | 'bottom-up'
  | 'recursive'

export interface TreeViewItem {
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
  draggable?: boolean
  droppable?: boolean
}

export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: Component
  action: (items: TreeViewItem[]) => void
}

export interface TreeDragDropEvent {
  items: TreeViewItem[]
  sourceParentId: string | null
  targetParentId: string | null
  targetId: string
  zone: 'before' | 'after' | 'inside'
  preventDefault: () => void
  defaultPrevented: boolean
}
```

## Scripts

Todos os comandos sao executados a partir da raiz do repositorio:

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
```

## Contribuicao

- Use o fluxo de planejamento em `specs/` para novas funcionalidades
- Trabalhe na raiz do repositorio para codigo de produto e demo
- Antes de abrir um PR, valide `pnpm type-check` e `pnpm build`

## Creditos

- Projeto base original: [`neigebaie/shadcn-ui-tree-view`](https://github.com/neigebaie/shadcn-ui-tree-view)
- Esta versao em Vue e mantida neste fork
