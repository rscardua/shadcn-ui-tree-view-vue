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

export interface TreeViewNodeAction {
  id: string
  icon: Component
  tooltip: string
  action?: (item: TreeViewItem) => void
}

export type TreeViewNodeActionsMap = Record<string, TreeViewNodeAction[]>

export interface TreeViewProps {
  data: TreeViewItem[]
  title?: string
  showExpandAll?: boolean
  showCheckboxes?: boolean
  recursiveSelect?: boolean
  searchPlaceholder?: string
  selectionText?: string
  checkboxLabels?: {
    check: string
    uncheck: string
  }
  iconMap?: TreeViewIconMap
  menuItems?: TreeViewMenuItem[]
  nodeActions?: TreeViewNodeActionsMap
}
