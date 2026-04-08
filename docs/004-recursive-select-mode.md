# 004 - Modo Recursivo de Checkbox

**Status:** Implementado
**Data:** 2026-04-08

## Resumo

Propriedade `recursiveSelect` no componente TreeView que controla o modo de propagacao dos checkboxes. Quando desabilitada (padrao), cada checkbox e independente — marcar/desmarcar um no afeta apenas ele, e o estado visual reflete diretamente o campo `checked` do item. Quando habilitada, marcar/desmarcar um pai propaga para todos os descendentes, e o estado visual do pai e calculado automaticamente a partir dos filhos (checked, unchecked ou indeterminado).

---

## Guia de Uso

### Instalacao

O componente `TreeView` ja inclui suporte nativo. Nenhuma dependencia adicional e necessaria.

### Uso Basico

```vue
<template>
  <!-- Checkbox independente (padrao) — cada no so reflete seu proprio checked -->
  <TreeView :data="treeData" :show-checkboxes="true" @check-change="handleCheck" />

  <!-- Checkbox recursivo — pai propaga para filhos, visual indeterminado automatico -->
  <TreeView :data="treeData" :show-checkboxes="true" :recursive-select="true" @check-change="handleCheck" />
</template>
```

### Implementacao do Handler

O consumidor recebe `check-change` e deve atualizar os dados da arvore. O handler e o mesmo para ambos os modos — a diferenca e que com `recursiveSelect=true`, o TreeView emite o evento para o pai **e** cada descendente individualmente:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem } from '@/components/tree-view/types'

const recursiveSelect = ref(false)
const treeData = ref<TreeViewItem[]>([/* ... */])

function handleCheckChange(item: TreeViewItem, checked: boolean) {
  // Atualiza apenas o item recebido.
  // Com recursiveSelect=true, esta funcao e chamada
  // uma vez por no afetado (pai + cada descendente).
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

### Toggle em Runtime

A propriedade pode ser alternada em tempo de execucao. O estado atual dos checkboxes e preservado, mas as proximas acoes seguirao o novo modo e o visual se ajusta imediatamente:

- Ao trocar de `true` para `false`: cada checkbox passa a refletir apenas seu proprio `checked`, sem considerar filhos.
- Ao trocar de `false` para `true`: o visual do pai e recalculado a partir dos filhos (pode mostrar indeterminado se houver inconsistencia).

---

## Referencia da API

### Props do TreeView (adicoes)

| Prop | Tipo | Padrao | Descricao |
|------|------|--------|-----------|
| `recursiveSelect` | `boolean` | `false` | Controla o modo de propagacao dos checkboxes. `false`: independente. `true`: recursivo com indeterminado. |

### Eventos (comportamento refinado)

| Evento | Payload | Descricao |
|--------|---------|-----------|
| `check-change` | `item: TreeViewItem, checked: boolean` | Com `recursiveSelect=true`, emitido para cada no afetado (pai + descendentes). Com `false`, emitido apenas para o no clicado. |

### Provide/Inject

| Chave | Tipo | Descricao |
|-------|------|-----------|
| `TREE_RECURSIVE_SELECT` | `InjectionKey<Ref<boolean>>` | Valor reativo da prop, consumido pelo TreeItem para decidir como calcular o estado visual do checkbox |

---

## Comportamentos

### Modo Independente (`recursiveSelect=false`, padrao)

- Clicar no checkbox de um no emite `check-change` apenas para aquele no
- O estado visual do checkbox reflete **apenas** o campo `checked` do proprio item
- Marcar/desmarcar um pai **nao afeta** os filhos
- Marcar/desmarcar um filho **nao afeta** o pai
- Nao existe estado indeterminado — cada checkbox e checked ou unchecked

### Modo Recursivo (`recursiveSelect=true`)

- Clicar no checkbox de um no com filhos emite `check-change` para o no e todos os descendentes recursivamente
- O estado visual do checkbox de um pai e **calculado** a partir dos filhos via `getCheckState()`:
  - **checked**: todos os filhos estao checked
  - **unchecked**: nenhum filho esta checked
  - **indeterminado**: alguns filhos checked, outros nao
- Nos folha (sem filhos) comportam-se da mesma forma em ambos os modos

### Estado Indeterminado (apenas modo recursivo)

- Calculado automaticamente pela funcao `getCheckState()` baseado nos campos `checked` dos filhos
- Propaga para cima em todos os niveis de ancestrais
- Visual: icone de dash (—) no checkbox, com fundo primary
- ARIA: `aria-checked="mixed"` para acessibilidade
- Clicar num checkbox indeterminado marca o no e (com propagacao) todos os descendentes

### Compatibilidade Retroativa

- Omitir `:recursive-select` mantem o comportamento identico ao anterior
- O padrao `false` preserva o comportamento pre-existente de checkboxes independentes
- O modelo de dados `TreeViewItem` nao foi alterado
- Nenhuma funcionalidade de selecao visual (highlight) foi modificada

### Acessibilidade

- `aria-checked` usa `true`, `false` e `mixed` (indeterminado) conforme WAI-ARIA
- Navegacao por teclado (Space) dispara o checkbox respeitando o modo recursivo
- Modo recursivo vs independente nao afeta a navegacao — apenas a propagacao

---

## Exemplos

### Alternando Modo em Runtime

```vue
<script setup lang="ts">
import { ref } from 'vue'

const recursiveSelect = ref(false)
</script>

<template>
  <label>
    <input type="checkbox" v-model="recursiveSelect" />
    Checkbox recursivo
  </label>

  <TreeView
    :data="treeData"
    :show-checkboxes="true"
    :recursive-select="recursiveSelect"
    @check-change="handleCheckChange"
  />
</template>
```

### Handler Alternativo com Propagacao no Consumidor

Se preferir controlar a propagacao no consumidor em vez de depender dos emits multiplos do TreeView:

```vue
<script setup lang="ts">
function handleCheckChange(item: TreeViewItem, checked: boolean) {
  const updateAllChildren = (children: TreeViewItem[], checked: boolean): TreeViewItem[] =>
    children.map((child) => ({
      ...child,
      checked,
      children: child.children ? updateAllChildren(child.children, checked) : undefined,
    }))

  const update = (items: TreeViewItem[]): TreeViewItem[] =>
    items.map((i) => {
      if (i.id === item.id) {
        if (recursiveSelect.value && i.children) {
          return { ...i, checked, children: updateAllChildren(i.children, checked) }
        }
        return { ...i, checked }
      }
      return i.children ? { ...i, children: update(i.children) } : i
    })

  treeData.value = update(treeData.value)
}
</script>
```

---

## Estrutura de Arquivos

```text
vue/src/
  components/
    tree-view/
      TreeView.vue        # Prop recursiveSelect, provide reativo, handleCheckChange com propagacao
      TreeItem.vue         # Inject recursiveSelect, checkState condicional (proprio vs filhos)
      types.ts             # recursiveSelect em TreeViewProps
      keys.ts              # TREE_RECURSIVE_SELECT injection key
      utils.ts             # getCheckState (calculo agregado para modo recursivo)
```

---

## Decisoes de Design

| Aspecto | Decisao | Motivo |
|---------|---------|--------|
| Sistema alvo | Checkboxes (`checked`), nao selecao visual (`selectedIds`) | A feature controla propagacao de check/uncheck, nao highlight de selecao |
| Modo independente | Checkbox reflete apenas `item.checked` | Cada no e autonomo — sem cascata, sem indeterminado |
| Modo recursivo | `getCheckState()` calcula estado a partir dos filhos | Consistencia visual automatica com estado indeterminado |
| Propagacao | Via emits multiplos no TreeView | O consumidor controla a mutacao dos dados — padrao Vue de props imutaveis |
| Provide | `toRef(props, 'recursiveSelect')` | Reativo — TreeItem recalcula checkState quando o modo muda |
| Padrao | `false` | Compatibilidade retroativa total com o comportamento pre-existente |
| Modelo de dados | Sem mudancas | Usa o campo `checked` existente em TreeViewItem |
