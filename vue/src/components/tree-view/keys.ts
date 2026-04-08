import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { DropZone, TreeViewIconMap, TreeViewItem, TreeViewMenuItem, TreeViewNodeActionsMap } from './types'

export const TREE_SELECTED_IDS: InjectionKey<Ref<Set<string>>> = Symbol('TREE_SELECTED_IDS')
export const TREE_EXPANDED_IDS: InjectionKey<Ref<Set<string>>> = Symbol('TREE_EXPANDED_IDS')
export const TREE_FOCUSED_ID: InjectionKey<Ref<string | null>> = Symbol('TREE_FOCUSED_ID')
export const TREE_ITEM_MAP: InjectionKey<ComputedRef<Map<string, TreeViewItem>>> = Symbol('TREE_ITEM_MAP')
export const TREE_DATA: InjectionKey<Ref<TreeViewItem[]>> = Symbol('TREE_DATA')
export const TREE_ON_SELECT: InjectionKey<(item: TreeViewItem, event: MouseEvent) => void> = Symbol('TREE_ON_SELECT')
export const TREE_ON_TOGGLE: InjectionKey<(id: string, isOpen: boolean) => void> = Symbol('TREE_ON_TOGGLE')
export const TREE_ON_CHECK: InjectionKey<(item: TreeViewItem, checked: boolean) => void> = Symbol('TREE_ON_CHECK')
export const TREE_SHOW_CHECKBOXES: InjectionKey<boolean> = Symbol('TREE_SHOW_CHECKBOXES')
export const TREE_ICON_MAP: InjectionKey<TreeViewIconMap> = Symbol('TREE_ICON_MAP')
export const TREE_MENU_ITEMS: InjectionKey<TreeViewMenuItem[]> = Symbol('TREE_MENU_ITEMS')

// Node action buttons
export const TREE_NODE_ACTIONS: InjectionKey<TreeViewNodeActionsMap> = Symbol('TREE_NODE_ACTIONS')
export const TREE_ON_NODE_ACTION: InjectionKey<(actionId: string, item: TreeViewItem) => void> = Symbol('TREE_ON_NODE_ACTION')

// Recursive select mode
export const TREE_RECURSIVE_SELECT: InjectionKey<Ref<boolean>> = Symbol('tree-recursive-select')

// Slot render functions (provided by TreeView, consumed by TreeItem recursively)
export const TREE_ICON_SLOT: InjectionKey<((props: { item: TreeViewItem; depth: number }) => any) | null> = Symbol('TREE_ICON_SLOT')
export const TREE_LABEL_SLOT: InjectionKey<((props: { item: TreeViewItem }) => any) | null> = Symbol('TREE_LABEL_SLOT')

// Drag and drop
export const TREE_ENABLE_DRAG_DROP: InjectionKey<boolean> = Symbol('TREE_ENABLE_DRAG_DROP')
export const TREE_DRAG_STATE: InjectionKey<{
  isDragging: Ref<boolean>
  draggedIds: Ref<Set<string>>
  dropTargetId: Ref<string | null>
  dropZone: Ref<DropZone | null>
}> = Symbol('TREE_DRAG_STATE')
export const TREE_ON_DRAG_START: InjectionKey<(item: TreeViewItem, event: DragEvent) => void> = Symbol('TREE_ON_DRAG_START')
export const TREE_ON_DRAG_OVER: InjectionKey<(item: TreeViewItem, event: DragEvent) => void> = Symbol('TREE_ON_DRAG_OVER')
export const TREE_ON_DROP: InjectionKey<(item: TreeViewItem, event: DragEvent) => void> = Symbol('TREE_ON_DROP')
export const TREE_ON_DRAG_END: InjectionKey<(event: DragEvent) => void> = Symbol('TREE_ON_DRAG_END')
