import type { TreeViewItem } from './types'

export function buildItemMap(items: TreeViewItem[]): Map<string, TreeViewItem> {
  const map = new Map<string, TreeViewItem>()
  const processItem = (item: TreeViewItem) => {
    map.set(item.id, item)
    item.children?.forEach(processItem)
  }
  items.forEach(processItem)
  return map
}

export function getAllFolderIds(items: TreeViewItem[]): string[] {
  const ids: string[] = []
  const collect = (items: TreeViewItem[]) => {
    items.forEach((item) => {
      if (item.children) {
        ids.push(item.id)
        collect(item.children)
      }
    })
  }
  collect(items)
  return ids
}

export function getItemPath(item: TreeViewItem, allItems: TreeViewItem[]): string {
  const path: string[] = [item.name]

  const findParent = (currentItem: TreeViewItem, items: TreeViewItem[]) => {
    for (const potentialParent of items) {
      if (potentialParent.children?.some((child) => child.id === currentItem.id)) {
        path.unshift(potentialParent.name)
        findParent(potentialParent, allItems)
        return
      }
      if (potentialParent.children) {
        findParent(currentItem, potentialParent.children)
      }
    }
  }

  findParent(item, allItems)
  return path.join(' → ')
}

export function filterTree(
  items: TreeViewItem[],
  query: string,
  expandedIds: Set<string>,
): { filtered: TreeViewItem[]; expandIds: Set<string> } {
  if (!query.trim()) {
    return { filtered: items, expandIds: new Set() }
  }

  const searchLower = query.toLowerCase()
  const newExpandedIds = new Set<string>()

  const itemMatches = (item: TreeViewItem): boolean => {
    if (item.name.toLowerCase().includes(searchLower)) return true
    if (item.children) {
      return item.children.some((child) => itemMatches(child))
    }
    return false
  }

  const filter = (items: TreeViewItem[]): TreeViewItem[] => {
    return items
      .map((item) => {
        if (!item.children) {
          return itemMatches(item) ? item : null
        }

        const filteredChildren = filter(item.children)
        if (filteredChildren.length > 0 || item.name.toLowerCase().includes(searchLower)) {
          newExpandedIds.add(item.id)
          return { ...item, children: filteredChildren }
        }
        return null
      })
      .filter((item): item is TreeViewItem => item !== null)
  }

  return { filtered: filter(items), expandIds: newExpandedIds }
}

export function getSelectedChildrenCount(item: TreeViewItem, selectedIds: Set<string>): number {
  let count = 0
  if (!item.children) return 0

  item.children.forEach((child) => {
    if (selectedIds.has(child.id)) count++
    if (child.children) {
      count += getSelectedChildrenCount(child, selectedIds)
    }
  })

  return count
}

export function getVisibleItems(items: TreeViewItem[], expandedIds: Set<string>): TreeViewItem[] {
  const visible: TreeViewItem[] = []

  const collect = (items: TreeViewItem[]) => {
    items.forEach((item) => {
      visible.push(item)
      if (item.children && expandedIds.has(item.id)) {
        collect(item.children)
      }
    })
  }

  collect(items)
  return visible
}

export function getCheckState(
  item: TreeViewItem,
  itemMap: Map<string, TreeViewItem>,
): 'checked' | 'unchecked' | 'indeterminate' {
  const originalItem = itemMap.get(item.id)
  if (!originalItem) return 'unchecked'

  if (!originalItem.children || originalItem.children.length === 0) {
    return originalItem.checked ? 'checked' : 'unchecked'
  }

  let checkedCount = 0
  let indeterminateCount = 0

  originalItem.children.forEach((child) => {
    const childState = getCheckState(child, itemMap)
    if (childState === 'checked') checkedCount++
    if (childState === 'indeterminate') indeterminateCount++
  })

  const totalChildren = originalItem.children.length

  if (checkedCount === totalChildren) return 'checked'
  if (checkedCount > 0 || indeterminateCount > 0) return 'indeterminate'
  return 'unchecked'
}
