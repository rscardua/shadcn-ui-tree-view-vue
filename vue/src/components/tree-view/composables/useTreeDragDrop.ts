import { ref, type Ref } from 'vue'
import type { DropZone, TreeDragDropEvent, TreeViewItem } from '../types'
import { findParentNode, getAllDescendantIds, moveMultipleNodes, moveNode } from '../utils'

export interface UseTreeDragDropOptions {
  data: Ref<TreeViewItem[]>
  selectedIds: Ref<Set<string>>
  expandedIds: Ref<Set<string>>
  onDrop?: (event: TreeDragDropEvent) => void
  onUpdateData?: (data: TreeViewItem[]) => void
}

export function useTreeDragDrop(options: UseTreeDragDropOptions) {
  const { data, selectedIds, expandedIds, onDrop, onUpdateData } = options

  const isDragging = ref(false)
  const draggedIds = ref<Set<string>>(new Set())
  const dropTargetId = ref<string | null>(null)
  const dropZone = ref<DropZone | null>(null)

  // Auto-scroll state
  let scrollAnimationId: number | null = null
  let scrollContainer: HTMLElement | null = null

  function findNode(id: string, items: TreeViewItem[]): TreeViewItem | null {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findNode(id, item.children)
        if (found) return found
      }
    }
    return null
  }

  function isDescendantOf(potentialDescendantId: string, ancestorId: string): boolean {
    const ancestor = findNode(ancestorId, data.value)
    if (!ancestor) return false
    return getAllDescendantIds(ancestor).includes(potentialDescendantId)
  }

  function isValidDrop(targetId: string): boolean {
    // Can't drop on self
    if (draggedIds.value.has(targetId)) return false
    // Can't drop on descendant of any dragged node
    for (const draggedId of draggedIds.value) {
      if (isDescendantOf(targetId, draggedId)) return false
    }
    return true
  }

  function computeDropZone(event: DragEvent, element: HTMLElement): DropZone {
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    const height = rect.height
    const ratio = y / height

    // Check if target has children (is a folder)
    const targetId = element.getAttribute('data-id')
    const target = targetId ? findNode(targetId, data.value) : null
    const isFolder = target?.children !== undefined

    if (isFolder) {
      // Folder: top 25% = before, middle 50% = inside, bottom 25% = after
      if (ratio < 0.25) return 'before'
      if (ratio > 0.75) return 'after'
      return 'inside'
    } else {
      // Leaf: top 33% = before, middle 33% = inside, bottom 33% = after
      if (ratio < 0.33) return 'before'
      if (ratio > 0.67) return 'after'
      return 'inside'
    }
  }

  function handleDragStart(item: TreeViewItem, event: DragEvent) {
    if (item.draggable === false) return

    isDragging.value = true

    // If the dragged item is selected, drag all selected nodes
    if (selectedIds.value.has(item.id) && selectedIds.value.size > 1) {
      draggedIds.value = new Set(selectedIds.value)
    } else {
      draggedIds.value = new Set([item.id])
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', item.id)

      // Show count badge for multi-drag
      if (draggedIds.value.size > 1) {
        const badge = document.createElement('div')
        badge.textContent = `${draggedIds.value.size} items`
        badge.style.cssText = 'padding:4px 12px;background:#3b82f6;color:white;border-radius:6px;font-size:13px;font-weight:500;'
        document.body.appendChild(badge)
        event.dataTransfer.setDragImage(badge, 0, 0)
        requestAnimationFrame(() => badge.remove())
      }
    }
  }

  function handleDragOver(item: TreeViewItem, event: DragEvent) {
    if (item.droppable === false) return

    const targetElement = (event.currentTarget as HTMLElement)
    const zone = computeDropZone(event, targetElement)

    if (!isValidDrop(item.id)) {
      event.dataTransfer!.dropEffect = 'none'
      dropTargetId.value = null
      dropZone.value = null
      return
    }

    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
    dropTargetId.value = item.id
    dropZone.value = zone

    // Auto-scroll
    startAutoScroll(event)
  }

  function handleDrop(item: TreeViewItem, event: DragEvent) {
    event.preventDefault()
    stopAutoScroll()

    if (!dropTargetId.value || !dropZone.value) {
      resetDragState()
      return
    }

    if (!isValidDrop(item.id)) {
      resetDragState()
      return
    }

    const draggedItems: TreeViewItem[] = []
    for (const id of draggedIds.value) {
      const node = findNode(id, data.value)
      if (node) draggedItems.push(node)
    }

    // Find source parent
    const firstDraggedId = Array.from(draggedIds.value)[0]!
    const sourceInfo = findParentNode(firstDraggedId, data.value)

    // Find target parent
    const zone = dropZone.value
    let targetParentId: string | null = null
    if (zone === 'inside') {
      targetParentId = item.id
    } else {
      const targetInfo = findParentNode(item.id, data.value)
      targetParentId = targetInfo.parent?.id ?? null
    }

    // Build cancelable event
    let prevented = false
    const dropEvent: TreeDragDropEvent = {
      items: draggedItems,
      sourceParentId: sourceInfo.parent?.id ?? null,
      targetParentId,
      targetId: item.id,
      zone,
      preventDefault: () => { prevented = true },
      get defaultPrevented() { return prevented },
    }

    // Emit drop event
    onDrop?.(dropEvent)

    if (!prevented) {
      // Execute tree mutation
      if (draggedIds.value.size > 1) {
        moveMultipleNodes(data.value, Array.from(draggedIds.value), item.id, zone)
      } else {
        moveNode(data.value, firstDraggedId, item.id, zone)
      }

      // Auto-expand target if dropping inside
      if (zone === 'inside') {
        expandedIds.value = new Set([...expandedIds.value, item.id])
      }

      onUpdateData?.(data.value)
    }

    resetDragState()
  }

  function handleDragEnd(_event: DragEvent) {
    stopAutoScroll()
    resetDragState()
  }

  function handleDragLeave(_item: TreeViewItem, event: DragEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement | null
    if (!relatedTarget || !relatedTarget.closest?.('[role="tree"]')) {
      dropTargetId.value = null
      dropZone.value = null
    }
  }

  function resetDragState() {
    isDragging.value = false
    draggedIds.value = new Set()
    dropTargetId.value = null
    dropZone.value = null
  }

  // Auto-scroll during drag
  function startAutoScroll(event: DragEvent) {
    if (!scrollContainer) {
      scrollContainer = (event.target as HTMLElement)?.closest('[role="tree"]')?.parentElement ?? null
    }
    if (!scrollContainer) return

    stopAutoScroll()

    const scroll = () => {
      if (!scrollContainer || !isDragging.value) return
      const rect = scrollContainer.getBoundingClientRect()
      const threshold = 40
      const y = event.clientY

      if (y - rect.top < threshold) {
        const speed = Math.max(1, (threshold - (y - rect.top)) / 2)
        scrollContainer.scrollTop -= speed
      } else if (rect.bottom - y < threshold) {
        const speed = Math.max(1, (threshold - (rect.bottom - y)) / 2)
        scrollContainer.scrollTop += speed
      }

      scrollAnimationId = requestAnimationFrame(scroll)
    }
    scrollAnimationId = requestAnimationFrame(scroll)
  }

  function stopAutoScroll() {
    if (scrollAnimationId !== null) {
      cancelAnimationFrame(scrollAnimationId)
      scrollAnimationId = null
    }
    scrollContainer = null
  }

  return {
    isDragging,
    draggedIds,
    dropTargetId,
    dropZone,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleDragLeave,
  }
}
