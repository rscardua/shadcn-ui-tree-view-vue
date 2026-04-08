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

export function getAllDescendantIds(item: TreeViewItem): string[] {
  const ids: string[] = []
  const collect = (children: TreeViewItem[]) => {
    children.forEach((child) => {
      ids.push(child.id)
      if (child.children) collect(child.children)
    })
  }
  if (item.children) collect(item.children)
  return ids
}

export function findAncestors(itemId: string, data: TreeViewItem[]): TreeViewItem[] {
  const path: TreeViewItem[] = []
  const search = (items: TreeViewItem[]): boolean => {
    for (const item of items) {
      if (item.id === itemId) return true
      if (item.children) {
        path.push(item)
        if (search(item.children)) return true
        path.pop()
      }
    }
    return false
  }
  search(data)
  return path
}

export function getSelectionState(
  item: TreeViewItem,
  selectedIds: Set<string>,
): 'selected' | 'unselected' | 'indeterminate' {
  if (!item.children || item.children.length === 0) {
    return selectedIds.has(item.id) ? 'selected' : 'unselected'
  }

  let selectedCount = 0
  let indeterminateCount = 0

  item.children.forEach((child) => {
    const childState = getSelectionState(child, selectedIds)
    if (childState === 'selected') selectedCount++
    if (childState === 'indeterminate') indeterminateCount++
  })

  const totalChildren = item.children.length

  if (selectedCount === totalChildren && selectedIds.has(item.id)) return 'selected'
  if (selectedCount > 0 || indeterminateCount > 0 || selectedIds.has(item.id)) return 'indeterminate'
  return 'unselected'
}

// --- Drag-drop tree mutation utilities ---

export function findParentNode(
  nodeId: string,
  tree: TreeViewItem[],
): { parent: TreeViewItem | null; siblings: TreeViewItem[] } {
  for (const item of tree) {
    if (item.children) {
      if (item.children.some((c) => c.id === nodeId)) {
        return { parent: item, siblings: item.children }
      }
      const found = findParentNode(nodeId, item.children)
      if (found.siblings.length > 0) return found
    }
  }
  // Node is at root level
  if (tree.some((t) => t.id === nodeId)) {
    return { parent: null, siblings: tree }
  }
  return { parent: null, siblings: [] }
}

export function removeNodeFromTree(tree: TreeViewItem[], nodeId: string): TreeViewItem | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i]!.id === nodeId) {
      return tree.splice(i, 1)[0]!
    }
    if (tree[i]!.children) {
      const removed = removeNodeFromTree(tree[i]!.children!, nodeId)
      if (removed) return removed
    }
  }
  return null
}

export function insertNodeInTree(
  tree: TreeViewItem[],
  node: TreeViewItem,
  targetId: string,
  zone: 'before' | 'after' | 'inside',
): boolean {
  if (zone === 'inside') {
    const findTarget = (items: TreeViewItem[]): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          if (!item.children) item.children = []
          item.children.push(node)
          return true
        }
        if (item.children && findTarget(item.children)) return true
      }
      return false
    }
    return findTarget(tree)
  }

  // before or after
  const insertInSiblings = (items: TreeViewItem[]): boolean => {
    for (let i = 0; i < items.length; i++) {
      if (items[i]!.id === targetId) {
        const insertIndex = zone === 'before' ? i : i + 1
        items.splice(insertIndex, 0, node)
        return true
      }
      if (items[i]!.children && insertInSiblings(items[i]!.children!)) return true
    }
    return false
  }
  return insertInSiblings(tree)
}

export function moveNode(
  tree: TreeViewItem[],
  nodeId: string,
  targetId: string,
  zone: 'before' | 'after' | 'inside',
): boolean {
  const node = removeNodeFromTree(tree, nodeId)
  if (!node) return false
  return insertNodeInTree(tree, node, targetId, zone)
}

export function moveMultipleNodes(
  tree: TreeViewItem[],
  nodeIds: string[],
  targetId: string,
  zone: 'before' | 'after' | 'inside',
): boolean {
  // Filter out nodes whose ancestors are also selected
  const idSet = new Set(nodeIds)
  const filtered = nodeIds.filter((id) => {
    const ancestors = findAncestors(id, tree)
    return !ancestors.some((a) => idSet.has(a.id))
  })

  // Collect tree order for sorting
  const orderMap = new Map<string, number>()
  let order = 0
  const walk = (items: TreeViewItem[]) => {
    for (const item of items) {
      orderMap.set(item.id, order++)
      if (item.children) walk(item.children)
    }
  }
  walk(tree)

  filtered.sort((a, b) => (orderMap.get(a) ?? 0) - (orderMap.get(b) ?? 0))

  // Remove all nodes
  const removed: TreeViewItem[] = []
  for (const id of filtered) {
    const node = removeNodeFromTree(tree, id)
    if (node) removed.push(node)
  }

  // Insert in reverse order for before/after to maintain relative order
  if (zone === 'before' || zone === 'after') {
    for (let i = removed.length - 1; i >= 0; i--) {
      insertNodeInTree(tree, removed[i]!, targetId, zone === 'after' && i < removed.length - 1 ? 'after' : zone)
      // After first insert for 'after', remaining should go 'after' the previous
    }
  } else {
    // inside: push in order
    for (const node of removed) {
      insertNodeInTree(tree, node, targetId, zone)
    }
  }

  return removed.length > 0
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
