# Shadcn/ui Tree View (Vue)

Componente Tree View em Vue 3 para interfaces administrativas, com busca, seleção avançada, checkboxes em cascata, menu de contexto e hover cards. Tecnologias principais: Vue 3, TypeScript, Reka UI e Tailwind CSS.

## Captura / Demonstração

> Observação: gere uma nova captura do demo em Vue em `http://localhost:5173` após a consolidação. A imagem antiga do projeto React foi removida de propósito.

## Recursos

- Renderização em árvore com expandir e recolher por nível
- Seleção simples, múltipla, por intervalo e por arraste
- Busca e filtro em tempo real
- Checkboxes em cascata com sincronização entre pais e filhos
- Menus de contexto por item
- Hover cards com metadados do item

## Requisitos

| Requisito | Versão |
|-----------|--------|
| Node.js | 20.19+ ou 22.12+ |
| pnpm | 10+ |

## Instalação

### Opção A: Desenvolvimento (clonar e executar)

```bash
git clone https://github.com/neigebaie/shadcn-ui-tree-view-vue.git
cd shadcn-ui-tree-view-vue/vue
pnpm install
pnpm dev
```

O demo fica disponível em `http://localhost:5173`.

### Opção B: Copiar o componente (integração manual)

1. Copie `vue/src/components/tree-view/` para `src/components/tree-view/` no projeto de destino.
2. Copie ou recrie os componentes base usados pelo componente em `src/components/ui/`: `badge`, `button`, `checkbox`, `collapsible`, `context-menu`, `hover-card` e `input`.
3. Copie `vue/src/lib/utils.ts` ou adapte a função `cn()` à convenção do seu projeto.
4. Instale as dependências abaixo no projeto de destino:

```bash
pnpm add @lucide/vue class-variance-authority clsx reka-ui tailwind-merge tw-animate-css
```

5. Garanta que o alias `@/` aponte para `src/`, ou ajuste os imports copiados.
6. Antes de montar o Tree View, use um tema Tailwind/shadcn-vue compatível com os componentes acima.

## API do componente

### Propriedades (`TreeViewProps`)

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `data` | `TreeViewItem[]` | obrigatório | Estrutura hierárquica exibida pelo componente. |
| `title` | `string \| undefined` | `undefined` | Reservado para uso futuro. |
| `showExpandAll` | `boolean` | `true` | Exibe os botões de expandir e recolher tudo. |
| `showCheckboxes` | `boolean` | `false` | Habilita checkboxes com comportamento em cascata. |
| `searchPlaceholder` | `string` | `"Search..."` | Texto exibido no campo de busca. |
| `selectionText` | `string` | `"selected"` | Rótulo exibido ao lado da contagem de itens selecionados. |
| `checkboxLabels` | `{ check: string; uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Personaliza os botões de marcar e desmarcar na barra de seleção. |
| `iconMap` | `TreeViewIconMap \| undefined` | `undefined` | Mapa opcional entre o tipo do item e o componente de ícone em Vue. |
| `menuItems` | `TreeViewMenuItem[] \| undefined` | `undefined` | Ações exibidas no menu de contexto. |

### Eventos (`TreeViewEmits`)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `selection-change` | `TreeViewItem[]` | Disparado quando a seleção muda. |
| `check-change` | `TreeViewItem`, `boolean` | Disparado quando um checkbox muda de estado. |
| `action` | `string`, `TreeViewItem[]` | Disparado quando uma ação do menu de contexto é executada. |

### Slots (`TreeViewSlots`)

| Slot | Props do slot | Descrição |
|------|---------------|-----------|
| `icon` | `{ item: TreeViewItem; depth: number }` | Substitui o ícone padrão de cada item. |
| `label` | `{ item: TreeViewItem }` | Substitui a renderização do rótulo do item. |

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

## Exemplo de uso

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
          { id: '1.1.1', name: 'Catálogo', type: 'department' },
          { id: '1.1.2', name: 'Relatório.pdf', type: 'item' },
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
    action: (items) => console.log('Baixando os itens', items),
  },
]

function onSelectionChange(items: TreeViewItem[]) {
  console.log('Selecionados', items)
}

function onCheckChange(item: TreeViewItem, checked: boolean) {
  console.log('Checkbox alterado', item.name, checked)
}

function onAction(action: string, items: TreeViewItem[]) {
  console.log('Ação executada', action, items)
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

## Ambiente de desenvolvimento

```bash
cd vue
pnpm install
pnpm dev
pnpm build
pnpm type-check
```

## Contribuição

- Use o fluxo de planejamento descrito em `specs/` para novas funcionalidades.
- Trabalhe somente dentro de `vue/` para código de produto e demo.
- Mantenha um commit por unidade lógica de mudança.
- Antes de abrir um PR, confirme que `cd vue && pnpm dev` e `cd vue && pnpm type-check` funcionam sem regressão.

## Créditos

- Projeto base original: [`neigebaie/shadcn-ui-tree-view`](https://github.com/neigebaie/shadcn-ui-tree-view).
- Esta versão em Vue foi convertida com apoio de IA e segue com manutenção contínua neste fork pelos mantenedores atuais.
