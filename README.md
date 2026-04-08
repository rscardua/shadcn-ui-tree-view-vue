# Shadcn/ui Tree View (Vue)

Componente Tree View em Vue 3 para interfaces administrativas, com busca, seleção avançada, checkboxes com modo recursivo opcional, menu de contexto e hover cards. Tecnologias principais: Vue 3, TypeScript, Reka UI e Tailwind CSS.

## Captura / Demonstração

> Observação: gere uma nova captura do demo em Vue em `http://localhost:5173` após a consolidação. A imagem antiga do projeto React foi removida de propósito.

## Recursos

- Renderização em árvore com expandir e recolher por nível
- Seleção simples, múltipla, por intervalo e por arraste
- Busca e filtro em tempo real
- Checkboxes com modo recursivo opcional (marcar pai marca todos os descendentes)
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
| `showCheckboxes` | `boolean` | `false` | Habilita checkboxes nos nós da árvore. |
| `recursiveSelect` | `boolean` | `false` | Controla o modo de propagação dos checkboxes. Quando `false`, cada checkbox é independente — marcar/desmarcar um nó afeta apenas ele. Quando `true`, marcar/desmarcar um pai propaga para todos os descendentes, e o estado visual do pai reflete o estado agregado dos filhos (checked, unchecked ou indeterminado). |
| `searchPlaceholder` | `string` | `"Search..."` | Texto exibido no campo de busca. |
| `selectionText` | `string` | `"selected"` | Rótulo exibido ao lado da contagem de itens selecionados. |
| `checkboxLabels` | `{ check: string; uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Personaliza os botões de marcar e desmarcar na barra de seleção. |
| `iconMap` | `TreeViewIconMap \| undefined` | `undefined` | Mapa opcional entre o tipo do item e o componente de ícone em Vue. |
| `menuItems` | `TreeViewMenuItem[] \| undefined` | `undefined` | Ações exibidas no menu de contexto. |
| `nodeActions` | `TreeViewNodeActionsMap \| undefined` | `undefined` | Mapa de botões de ação por tipo de nó (aparecem no hover). |

### Eventos (`TreeViewEmits`)

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `selection-change` | `TreeViewItem[]` | Disparado quando a seleção muda. |
| `check-change` | `TreeViewItem`, `boolean` | Disparado quando um checkbox muda de estado. Com `recursiveSelect=true`, emitido para o pai e cada descendente individualmente. |
| `action` | `string`, `TreeViewItem[]` | Disparado quando uma ação do menu de contexto é executada. |
| `node-action` | `string`, `TreeViewItem` | Disparado quando um botão de ação de nó é clicado. |

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

### Uso basico

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

### Checkbox recursivo

A prop `recursive-select` controla como os checkboxes se comportam:

- **`false` (padrao)**: cada checkbox e independente. Marcar ou desmarcar um no afeta apenas ele. O estado visual do checkbox reflete diretamente o campo `checked` do item, sem considerar os filhos.
- **`true`**: marcar/desmarcar um pai propaga para todos os descendentes. O estado visual do pai e calculado a partir dos filhos (checked se todos marcados, indeterminado se parcial, unchecked se nenhum).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem } from '@/components/tree-view/types'

const recursiveSelect = ref(false)
const treeData = ref<TreeViewItem[]>([/* ... */])

function handleCheckChange(item: TreeViewItem, checked: boolean) {
  // Atualiza apenas o item recebido no evento.
  // Com recursiveSelect=true, o TreeView emite check-change
  // para o pai E cada descendente individualmente,
  // entao esta funcao e chamada uma vez por no afetado.
  const update = (items: TreeViewItem[]): TreeViewItem[] =>
    items.map((i) => {
      if (i.id === item.id) return { ...i, checked }
      return i.children ? { ...i, children: update(i.children) } : i
    })
  treeData.value = update(treeData.value)
}
</script>

<template>
  <TreeView
    :data="treeData"
    :show-checkboxes="true"
    :recursive-select="recursiveSelect"
    @check-change="handleCheckChange"
  />
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
