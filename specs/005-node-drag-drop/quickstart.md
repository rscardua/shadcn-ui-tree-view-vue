# Quickstart: Drag and Drop na Tree View

**Feature**: 005-node-drag-drop  
**Date**: 2026-04-08

## Resumo

Adicionar drag and drop ao TreeView existente para permitir reordenação de nós e reparenting via arrasto. Desktop-only (mouse).

## Pré-requisitos

- Branch `005-node-drag-drop` checked out
- `cd vue && pnpm install` executado
- `pnpm dev` rodando para verificação visual

## Arquivos a criar

1. **`vue/src/components/tree-view/composables/useTreeDragDrop.ts`** — Composable com toda a lógica de drag-drop
2. **`vue/src/components/tree-view/DropIndicator.vue`** — Componente de indicador visual de drop

## Arquivos a modificar

1. **`vue/src/components/tree-view/types.ts`** — Adicionar `TreeDragDropEvent`, `DropZone`, estender `TreeViewItem` com `draggable`/`droppable`
2. **`vue/src/components/tree-view/keys.ts`** — Adicionar injection keys para drag state
3. **`vue/src/components/tree-view/utils.ts`** — Adicionar `moveNode()`, `moveMultipleNodes()`, `removeNodeFromTree()`, `insertNodeInTree()`
4. **`vue/src/components/tree-view/TreeView.vue`** — Integrar composable, adicionar prop `enableDragDrop`, emitir evento `drop`, suporte a v-model:data
5. **`vue/src/components/tree-view/TreeItem.vue`** — Adicionar atributos `draggable`, handlers de drag events, renderizar DropIndicator, styling de drop zones
6. **`vue/src/App.vue`** — Adicionar demo com drag-drop habilitado
7. **`vue/src/lib/demo-data.ts`** — Adicionar exemplos com `draggable: false` para demonstrar restrição por nó

## Ordem de implementação sugerida

1. Types e keys (base para tudo)
2. Utils (funções de mutação da árvore)
3. useTreeDragDrop composable (lógica central)
4. DropIndicator.vue (feedback visual)
5. TreeItem.vue (integração dos handlers)
6. TreeView.vue (orquestração e props)
7. Demo e verificação visual
8. Acessibilidade via teclado (Alt+Arrow)

## Verificação

```bash
cd vue && pnpm type-check   # Sem erros de tipo
cd vue && pnpm build         # Build sem erros
cd vue && pnpm dev           # Verificação visual no browser
```

### Testes manuais prioritários

1. Arrastar nó A para antes de nó C no mesmo nível → reordena
2. Arrastar nó para dentro de pasta → vira filho
3. Arrastar pasta para dentro de seu filho → bloqueado (circular)
4. Selecionar 3 nós, arrastar juntos → todos movem
5. Alt+ArrowUp/Down no nó focado → reordena via teclado
6. `enableDragDrop` false → nenhum comportamento de drag
