# 003 - Botoes Flutuantes de Acao por No

**Status:** Implementado
**Data:** 2026-04-08

## Resumo

Botoes de acao flutuantes configuraveis por tipo de no na tree view. Os botoes aparecem no hover, ficam posicionados a direita da linha do no, possuem icones com tooltips, e suportam tanto callbacks diretos quanto eventos emitidos ao componente pai.

---

## Guia de Uso

### Instalacao

O componente `TreeView` ja inclui suporte nativo a botoes de acao. Nenhuma dependencia adicional e necessaria alem das ja existentes no projeto (`reka-ui`, `@lucide/vue`).

### Uso Basico

```vue
<script setup lang="ts">
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem, TreeViewNodeActionsMap } from '@/components/tree-view/types'
import { Pencil, Trash2, Eye } from '@lucide/vue'

const treeData: TreeViewItem[] = [
  {
    id: '1',
    name: 'Documentos',
    type: 'folder',
    children: [
      { id: '2', name: 'Relatorio.pdf', type: 'file' },
      { id: '3', name: 'Planilha.xlsx', type: 'file' },
    ],
  },
]

const nodeActions: TreeViewNodeActionsMap = {
  folder: [
    { id: 'edit', icon: Pencil, tooltip: 'Editar pasta' },
  ],
  file: [
    { id: 'view', icon: Eye, tooltip: 'Visualizar' },
    { id: 'delete', icon: Trash2, tooltip: 'Excluir' },
  ],
}
</script>

<template>
  <TreeView
    :data="treeData"
    :node-actions="nodeActions"
    @node-action="(actionId, item) => console.log(actionId, item)"
  />
</template>
```

### Uso com Callbacks Diretos

Cada acao pode ter um callback opcional que e executado ao clicar. O evento `node-action` e **sempre** emitido, independentemente de haver callback.

```ts
const nodeActions: TreeViewNodeActionsMap = {
  file: [
    {
      id: 'download',
      icon: Download,
      tooltip: 'Baixar arquivo',
      action: (item) => {
        // Callback direto - executado primeiro
        downloadFile(item.id)
      },
    },
    {
      id: 'delete',
      icon: Trash2,
      tooltip: 'Excluir',
      // Sem callback - apenas o evento @node-action sera emitido
    },
  ],
}
```

### Uso com Handler Centralizado

Para tratar todas as acoes em um unico lugar, use o evento `@node-action`:

```vue
<template>
  <TreeView
    :data="treeData"
    :node-actions="nodeActions"
    @node-action="handleNodeAction"
  />
</template>

<script setup lang="ts">
function handleNodeAction(actionId: string, item: TreeViewItem) {
  switch (actionId) {
    case 'edit':
      openEditor(item)
      break
    case 'delete':
      confirmDelete(item)
      break
    case 'view':
      openDetails(item)
      break
  }
}
</script>
```

### Uso Combinado com Outras Features

Os botoes de acao coexistem com todas as funcionalidades existentes:

```vue
<TreeView
  :data="treeData"
  :icon-map="customIconMap"
  :show-checkboxes="true"
  :show-expand-all="true"
  :menu-items="menuItems"
  :node-actions="nodeActions"
  @check-change="handleCheckChange"
  @selection-change="handleSelectionChange"
  @node-action="handleNodeAction"
/>
```

---

## Referencia da API

### Props do TreeView

| Prop | Tipo | Padrao | Descricao |
|------|------|--------|-----------|
| `data` | `TreeViewItem[]` | *obrigatorio* | Dados da arvore |
| `title` | `string` | `undefined` | Titulo opcional |
| `showExpandAll` | `boolean` | `true` | Mostra botoes expandir/recolher tudo |
| `showCheckboxes` | `boolean` | `false` | Habilita checkboxes nos nos |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder da barra de busca |
| `selectionText` | `string` | `'selected'` | Texto exibido na barra de selecao |
| `checkboxLabels` | `{ check: string, uncheck: string }` | `{ check: 'Check', uncheck: 'Uncheck' }` | Labels dos botoes de check/uncheck em massa |
| `iconMap` | `TreeViewIconMap` | `{}` | Mapa de icones por tipo de no |
| `menuItems` | `TreeViewMenuItem[]` | `[]` | Itens do menu de contexto (clique direito) |
| `nodeActions` | `TreeViewNodeActionsMap` | `{}` | Mapa de botoes de acao por tipo de no |

### Eventos do TreeView

| Evento | Payload | Descricao |
|--------|---------|-----------|
| `selection-change` | `items: TreeViewItem[]` | Emitido quando a selecao muda |
| `check-change` | `item: TreeViewItem, checked: boolean` | Emitido quando um checkbox muda |
| `action` | `action: string, items: TreeViewItem[]` | Emitido por acoes do menu de contexto |
| `node-action` | `actionId: string, item: TreeViewItem` | Emitido quando um botao de acao e clicado |

### Slots do TreeView

| Slot | Props | Descricao |
|------|-------|-----------|
| `icon` | `{ item: TreeViewItem, depth: number }` | Customiza o icone do no |
| `label` | `{ item: TreeViewItem }` | Customiza o label/nome do no |

---

## Interfaces TypeScript

### TreeViewItem

```ts
interface TreeViewItem {
  id: string            // Identificador unico do no
  name: string          // Nome exibido
  type: string          // Tipo do no (usado como chave no iconMap e nodeActions)
  children?: TreeViewItem[]  // Filhos (se presente, o no e uma pasta)
  checked?: boolean     // Estado do checkbox
}
```

### TreeViewNodeAction

```ts
interface TreeViewNodeAction {
  id: string                          // Identificador unico da acao
  icon: Component                     // Componente Vue de icone (ex: Lucide)
  tooltip: string                     // Texto do tooltip
  action?: (item: TreeViewItem) => void  // Callback opcional ao clicar
}
```

### TreeViewNodeActionsMap

```ts
type TreeViewNodeActionsMap = Record<string, TreeViewNodeAction[]>
```

Mapa onde cada chave e o valor do campo `type` de um `TreeViewItem`, e o valor e um array de acoes disponiveis para aquele tipo.

### TreeViewMenuItem

```ts
interface TreeViewMenuItem {
  id: string                              // Identificador unico
  label: string                           // Texto exibido no menu
  icon?: Component                        // Icone opcional
  action: (items: TreeViewItem[]) => void // Callback com os itens selecionados
}
```

### TreeViewIconMap

```ts
type TreeViewIconMap = Record<string, Component | undefined>
```

---

## Comportamentos

### Visibilidade dos Botoes

- Os botoes de acao sao **invisiveis por padrao**
- Aparecem com **transicao de opacidade** ao passar o mouse sobre a linha do no
- Desaparecem suavemente ao sair do hover
- Coexistem com o botao de info (HoverCard) sem sobreposicao

### Isolamento de Clique

- Clicar em um botao de acao **nao** seleciona o no
- Clicar em um botao de acao **nao** expande/recolhe o no
- O clique e isolado via `@click.stop`

### Ordem de Execucao ao Clicar

1. O callback `action` da `TreeViewNodeAction` e chamado primeiro (se definido)
2. O evento `node-action` e **sempre** emitido ao componente pai
3. Se o callback lanca um erro, o evento ainda e emitido (sao independentes)

### Reatividade

- Alterar o objeto `nodeActions` em runtime atualiza os botoes imediatamente
- Nao e necessario re-montar o componente

### Compatibilidade Retroativa

- Omitir a prop `:node-actions` mantem o comportamento identico ao anterior
- Nenhuma funcionalidade existente e afetada

### Acessibilidade

- Os botoes de acao sao elementos `<button>` nativos
- Cada botao possui `aria-label` com o texto do tooltip
- Tooltips sao implementados via Reka UI (acessiveis por padrao)

---

## Exemplos Avancados

### Acoes Dinamicas por Estado

```ts
const nodeActions = computed<TreeViewNodeActionsMap>(() => ({
  file: [
    { id: 'view', icon: Eye, tooltip: 'Visualizar' },
    // Mostrar botao de delete apenas se usuario for admin
    ...(isAdmin.value
      ? [{ id: 'delete', icon: Trash2, tooltip: 'Excluir' }]
      : []),
  ],
}))
```

### Integracao com Router

```ts
import { useRouter } from 'vue-router'

const router = useRouter()

const nodeActions: TreeViewNodeActionsMap = {
  store: [
    {
      id: 'open',
      icon: ExternalLink,
      tooltip: 'Abrir pagina da loja',
      action: (item) => router.push(`/stores/${item.id}`),
    },
  ],
}
```

### Acoes com Confirmacao

```ts
const showConfirmDialog = ref(false)
const pendingDelete = ref<TreeViewItem | null>(null)

function handleNodeAction(actionId: string, item: TreeViewItem) {
  if (actionId === 'delete') {
    pendingDelete.value = item
    showConfirmDialog.value = true
  }
}
```

### Tipos Sem Acoes

Tipos de no que nao estao no mapa simplesmente nao exibem botoes:

```ts
const nodeActions: TreeViewNodeActionsMap = {
  region: [{ id: 'view', icon: Eye, tooltip: 'Ver regiao' }],
  // 'store', 'department', 'item' nao tem acoes definidas
  // -> nenhum botao aparece para esses tipos
}
```

---

## Estrutura de Arquivos

```text
vue/src/
  components/
    tree-view/
      TreeView.vue        # Prop nodeActions, emit node-action, provide
      TreeItem.vue         # Inject, computed, handler, template dos botoes
      types.ts             # TreeViewNodeAction, TreeViewNodeActionsMap
      keys.ts              # TREE_NODE_ACTIONS, TREE_ON_NODE_ACTION
    ui/
      tooltip/             # Componentes de tooltip (Reka UI wrappers)
        Tooltip.vue
        TooltipProvider.vue
        TooltipTrigger.vue
        TooltipContent.vue
        index.ts
```

---

## Decisoes de Design

| Aspecto | Decisao | Motivo |
|---------|---------|--------|
| Configuracao | Mapa tipo -> acoes | Consistente com `iconMap` existente |
| Distribuicao | `provide`/`inject` | Padrao estabelecido no codebase |
| Tooltips | Reka UI | Ja e dependencia do projeto |
| Visibilidade | `group-hover` CSS | Mesmo padrao do botao de info existente |
| Isolamento | `@click.stop` | Mesmo padrao do checkbox e botao de info |
| Handlers | Callback + evento | Flexibilidade maxima para o consumidor |
