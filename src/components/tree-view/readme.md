# Tree View README for AI

Este arquivo descreve como uma IA deve consumir e estender o componente em `src/components/tree-view`.

## Escopo e API publica

- Entrada publica principal: `TreeView.vue`
- Tipos publicos: `types.ts`
- Arquivos internos de implementacao: `TreeItem.vue`, `DropIndicator.vue`, `keys.ts`, `utils.ts`, `composables/useTreeDragDrop.ts`
- Regra pratica: importe o componente por `@/components/tree-view/TreeView.vue` e os tipos por `@/components/tree-view/types`

Nao importe `TreeItem.vue` diretamente no app consumidor. Ele e um detalhe interno da recursao.

## Modelo mental correto

`TreeView` e um componente de apresentacao com estado interno de:

- expansao dos nos
- foco de teclado
- selecao visual
- busca local
- estado transitivo de drag and drop

O componente pai continua sendo o dono dos dados da arvore.

Uma IA nao deve assumir que `TreeView` persiste ou normaliza automaticamente:

- `checked`
- reordenacao final da arvore
- selecao como estado controlado
- expansao como estado controlado

Se o pai nao reagir aos eventos, a UI pode ate refletir uma interacao momentanea, mas os dados de negocio nao ficam sincronizados.

## Contrato dos dados

Use `TreeViewItem[]` como fonte de verdade:

```ts
export interface TreeViewItem {
  id: string
  name: string
  type: string
  children?: TreeViewItem[]
  checked?: boolean
  draggable?: boolean
  droppable?: boolean
}
```

Regras importantes:

- `id` deve ser unico na arvore inteira
- `name` e usado para renderizacao e busca
- `type` dirige `iconMap` e `nodeActions`
- `children` presente significa "pasta/no agrupador", mesmo quando `children: []`
- `checked` e o estado persistido pelo app pai
- `draggable: false` bloqueia inicio de drag naquele no
- `droppable: false` bloqueia receber drop naquele no

## Exemplo minimo correto

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem } from '@/components/tree-view/types'

const treeData = ref<TreeViewItem[]>([
  {
    id: 'root',
    name: 'Root',
    type: 'folder',
    children: [
      { id: 'a', name: 'File A', type: 'file', checked: false },
      { id: 'b', name: 'File B', type: 'file', checked: true },
    ],
  },
])

function updateChecked(items: TreeViewItem[], targetId: string, checked: boolean): TreeViewItem[] {
  return items.map((item) => {
    if (item.id === targetId) return { ...item, checked }
    if (item.children) {
      return { ...item, children: updateChecked(item.children, targetId, checked) }
    }
    return item
  })
}

function handleCheckChange(item: TreeViewItem, checked: boolean) {
  treeData.value = updateChecked(treeData.value, item.id, checked)
}

function handleUpdateData(data: TreeViewItem[]) {
  treeData.value = [...data]
}
</script>

<template>
  <TreeView
    :data="treeData"
    :show-checkboxes="true"
    :enable-selection="true"
    @check-change="handleCheckChange"
    @update:data="handleUpdateData"
  />
</template>
```

## Props publicas

| Prop | Tipo | Padrao | Como interpretar |
|---|---|---|---|
| `data` | `TreeViewItem[]` | obrigatoria | Arvore renderizada |
| `title` | `string` | sem uso visual atual | Existe no tipo, mas nao e renderizada no template atual |
| `showExpandAll` | `boolean` | `true` | Mostra botoes `Expand All` e `Collapse All` |
| `showCheckboxes` | `boolean` | `false` | Mostra checkboxes |
| `mode` | `'independent' \| 'top-down' \| 'bottom-up' \| 'recursive'` | `'independent'` | Define propagacao e estado visual dos checkboxes |
| `enableSelection` | `boolean` | `false` | Habilita selecao visual por clique, Ctrl/Meta, Shift e drag box |
| `enableDragDrop` | `boolean` | `false` | Habilita reorder e reparent via mouse e teclado |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder do filtro |
| `selectionText` | `string` | `'selected'` | Texto da barra de selecao |
| `checkboxLabels` | `{ check: string; uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Rotulos dos botoes coletivos |
| `iconMap` | `Record<string, Component \| undefined>` | `{}` efetivo | Mapa de icones por `item.type` |
| `menuItems` | `TreeViewMenuItem[]` | `[]` efetivo | Itens de menu de contexto |
| `nodeActions` | `Record<string, TreeViewNodeAction[]>` | `{}` efetivo | Botoes inline por tipo de no |

## Modos de checkbox

| Modo | Clique no no | Estado visual do no |
|---|---|---|
| `independent` | Afeta apenas o no clicado | Le `item.checked` diretamente |
| `top-down` | Afeta o no clicado e todos os descendentes | Le `item.checked` diretamente |
| `bottom-up` | Afeta o no clicado e recalcula ancestrais | Pastas podem ficar `indeterminate` com base nos filhos |
| `recursive` | Combina propagacao para baixo e para cima | Pastas podem ficar `indeterminate` com base nos filhos |

Detalhe importante para IA:

- em `top-down`, a UI nao calcula estado indeterminado automaticamente a partir dos filhos
- em `bottom-up` e `recursive`, um clique pode gerar varios eventos `check-change`
- o pai precisa aplicar cada evento recebido na estrutura `data`

## Eventos que o pai deve tratar

| Evento | Payload | Responsabilidade do pai |
|---|---|---|
| `selection-change` | `TreeViewItem[]` | Opcional. Usar para refletir selecao atual em outro painel |
| `check-change` | `(item, checked)` | Obrigatorio se `showCheckboxes=true` e o app precisa persistir selecao |
| `node-action` | `(actionId, item)` | Opcional. Telemetria, side effects, dialogos, etc. |
| `drop` | `TreeDragDropEvent` | Opcional. Validacao de negocio antes de aceitar o drop |
| `update:data` | `TreeViewItem[]` | Obrigatorio se `enableDragDrop=true` e o app precisa persistir a nova ordem |

### Semantica real dos eventos

- `selection-change` so e observado quando `enableSelection=true`
- `check-change` e emitido uma vez por no afetado, nao uma vez por gesto
- `node-action` acontece depois do callback inline opcional definido em `nodeActions[].action`
- `drop` e cancelavel por `event.preventDefault()`
- `update:data` e emitido apos a mutacao interna da arvore no fluxo padrao de drag and drop

## Tipos auxiliares publicos

```ts
export interface TreeViewMenuItem {
  id: string
  label: string
  icon?: Component
  action: (items: TreeViewItem[]) => void
}

export interface TreeViewNodeAction {
  id: string
  icon: Component
  tooltip: string
  action?: (item: TreeViewItem) => void
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

## Slots disponiveis

| Slot | Props | Uso |
|---|---|---|
| `icon` | `{ item, depth }` | Substitui o icone do no |
| `label` | `{ item }` | Substitui o texto principal do no |

Notas:

- o slot `label` nao recebe `depth`
- os slots sao propagados recursivamente para todos os niveis

## Interacoes suportadas

### Busca

- filtra por `item.name`
- comparacao case-insensitive
- quando ha busca, os ancestrais dos resultados sao expandidos automaticamente
- a busca nao escreve de volta em `data`

### Selecao visual

- clique simples seleciona um item
- `Ctrl` no Windows ou `Meta` no macOS faz toggle de itens
- `Shift` seleciona um intervalo pela ordem visivel no DOM
- clicar fora limpa a selecao
- com selecao desligada, clicar em uma pasta apenas abre/fecha

### Teclado

- `ArrowUp` e `ArrowDown` navegam pelos itens visiveis
- `ArrowRight` abre pasta ou foca o primeiro filho
- `ArrowLeft` fecha pasta ou volta para o pai
- `Enter` seleciona quando `enableSelection=true`
- `Space` alterna checkbox quando `showCheckboxes=true`
- `Home` e `End` vao para primeiro/ultimo item visivel
- `Alt+ArrowUp/Down/Left/Right` reordenam quando `enableDragDrop=true`

### Drag and drop

- se o usuario arrastar um item ja selecionado e houver multiplos selecionados, todos os selecionados entram no drag
- nao e permitido soltar um no nele mesmo nem em um descendente dele
- zonas de drop: `before`, `after`, `inside`
- `inside` em um item sem `children` cria `children=[]` e transforma o alvo em pasta na implementacao atual
- para bloquear regras de negocio mais complexas, use `@drop` e chame `preventDefault()`

## Regras para uma IA que for editar este componente

- trate `TreeView.vue` como fachada publica e `types.ts` como contrato
- preserve a responsabilidade do pai sobre `data`
- nao introduza estado duplicado para `checked` no componente
- se adicionar nova prop publica, atualize `types.ts` primeiro
- se alterar semantica de eventos, atualize este README e o `README.md` da raiz
- se precisar de expansao ou selecao controlada externamente, isso exige uma nova API publica; nao simule isso por efeitos colaterais escondidos

## Limitacoes e discrepancias atuais

- `title` existe em `TreeViewProps`, mas nao e usado no template atual
- o emit tipado `action` existe em `TreeView.vue`, mas nao ha `emit('action', ...)` na implementacao atual
- `menuItems[].action` e hoje o unico gancho funcional do menu de contexto
- `update:data` pode entregar a mesma referencia de arvore ja mutada; o pai normalmente deve reatribuir uma nova referencia

## Arquivos internos

- `TreeView.vue`: estado local, busca, selecao, teclado, provide/inject, emissao de eventos
- `TreeItem.vue`: renderizacao recursiva de cada no, menu de contexto, node actions, hover card
- `DropIndicator.vue`: linha visual para `before` e `after`
- `utils.ts`: funcoes de busca, selecao, propagacao de checkbox e mutacao da arvore
- `composables/useTreeDragDrop.ts`: fluxo de drag and drop, validacao e cancelamento

Use este README como fonte de verdade local para integracao automatizada e geracao de codigo que consome o componente.
