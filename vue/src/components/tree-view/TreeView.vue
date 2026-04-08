<script setup lang="ts">
import { computed, provide, ref, toRef, useSlots, watch } from 'vue'
import type { TreeViewItem, TreeViewProps } from './types'
import {
  TREE_DATA,
  TREE_EXPANDED_IDS,
  TREE_FOCUSED_ID,
  TREE_ICON_MAP,
  TREE_ICON_SLOT,
  TREE_ITEM_MAP,
  TREE_LABEL_SLOT,
  TREE_MENU_ITEMS,
  TREE_NODE_ACTIONS,
  TREE_ON_CHECK,
  TREE_ON_NODE_ACTION,
  TREE_ON_SELECT,
  TREE_ON_TOGGLE,
  TREE_SELECTED_IDS,
  TREE_SHOW_CHECKBOXES,
} from './keys'
import { buildItemMap, filterTree, getAllFolderIds, getCheckState, getVisibleItems } from './utils'
import TreeItem from './TreeItem.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronDown, ChevronRight, Search, X } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<TreeViewProps>(), {
  showExpandAll: true,
  showCheckboxes: false,
  searchPlaceholder: 'Search...',
  selectionText: 'selected',
  checkboxLabels: () => ({ check: 'Check', uncheck: 'Uncheck' }),
})

const emit = defineEmits<{
  (e: 'selection-change', items: TreeViewItem[]): void
  (e: 'check-change', item: TreeViewItem, checked: boolean): void
  (e: 'action', action: string, items: TreeViewItem[]): void
  (e: 'node-action', actionId: string, item: TreeViewItem): void
}>()

// State
const expandedIds = ref<Set<string>>(new Set())
const selectedIds = ref<Set<string>>(new Set())
const searchQuery = ref('')
const focusedId = ref<string | null>(null)
const lastSelectedId = ref<string | null>(null)
const treeRef = ref<HTMLDivElement>()
const dragRef = ref<HTMLDivElement>()

// Drag-select state
const isDragging = ref(false)
const dragStartY = ref<number | null>(null)
const dragStartPosition = ref<{ x: number; y: number } | null>(null)
const currentMouseY = ref(0)
const DRAG_THRESHOLD = 10

// Computed
const itemMap = computed(() => buildItemMap(props.data))

const filteredResult = computed(() =>
  filterTree(props.data, searchQuery.value, expandedIds.value),
)

const displayData = computed(() => filteredResult.value.filtered)

// Watch search to auto-expand matches
watch(
  () => filteredResult.value.expandIds,
  (newExpandIds) => {
    if (searchQuery.value.trim() && newExpandIds.size > 0) {
      expandedIds.value = new Set([...expandedIds.value, ...newExpandIds])
    }
  },
)

// Watch selectedIds to emit selection-change
watch(selectedIds, () => {
  emit('selection-change', getSelectedItems())
}, { deep: true })

// Click-away handler
function handleClickAway(e: MouseEvent) {
  const target = e.target as Element
  const clickedInside =
    treeRef.value?.contains(target) ||
    dragRef.value?.contains(target) ||
    target.closest('[role="menu"]') ||
    target.closest('[data-radix-popper-content-wrapper]')

  if (!clickedInside) {
    selectedIds.value = new Set()
    lastSelectedId.value = null
  }
}

// Mount/unmount click-away
import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('mousedown', handleClickAway))
onUnmounted(() => document.removeEventListener('mousedown', handleClickAway))

// Expand/collapse handlers
function handleExpandAll() {
  expandedIds.value = new Set(getAllFolderIds(props.data))
}

function handleCollapseAll() {
  expandedIds.value = new Set()
}

function handleToggleExpand(id: string, isOpen: boolean) {
  const newSet = new Set(expandedIds.value)
  if (isOpen) {
    newSet.add(id)
  } else {
    newSet.delete(id)
  }
  expandedIds.value = newSet
}

// Selection handler
function handleSelect(item: TreeViewItem, event: MouseEvent) {
  let newSelection = new Set(selectedIds.value)

  if (event.shiftKey && lastSelectedId.value !== null) {
    const items = Array.from(
      document.querySelectorAll('[data-tree-item]'),
    ) as HTMLElement[]
    const lastIndex = items.findIndex(
      (el) => el.getAttribute('data-id') === lastSelectedId.value,
    )
    const currentIndex = items.findIndex(
      (el) => el.getAttribute('data-id') === item.id,
    )
    const [start, end] = [
      Math.min(lastIndex, currentIndex),
      Math.max(lastIndex, currentIndex),
    ]

    items.slice(start, end + 1).forEach((el) => {
      const id = el.getAttribute('data-id')
      const parentFolderClosed = el.closest('[data-folder-closed="true"]')
      const isClosedFolder = el.getAttribute('data-folder-closed') === 'true'

      if (id && (isClosedFolder || !parentFolderClosed)) {
        newSelection.add(id)
      }
    })
  } else if (event.ctrlKey || event.metaKey) {
    if (newSelection.has(item.id)) {
      newSelection.delete(item.id)
    } else {
      newSelection.add(item.id)
    }
  } else {
    const wasSelected = newSelection.has(item.id)
    newSelection = new Set([item.id])
    if (item.children && wasSelected) {
      handleToggleExpand(item.id, !expandedIds.value.has(item.id))
    }
  }

  lastSelectedId.value = item.id
  selectedIds.value = newSelection
}

// Checkbox handler
function handleCheckChange(item: TreeViewItem, checked: boolean) {
  emit('check-change', item, checked)
}

// Get selected items
function getSelectedItems(): TreeViewItem[] {
  const items: TreeViewItem[] = []
  const processItem = (item: TreeViewItem) => {
    if (selectedIds.value.has(item.id)) {
      items.push(item)
    }
    item.children?.forEach(processItem)
  }
  props.data.forEach(processItem)
  return items
}

// Get effective selected items (filter out parents whose children are selected)
function getEffectiveSelectedItems(): TreeViewItem[] {
  const selected = getSelectedItems()
  const selectedIdsSet = new Set(selected.map((item) => item.id))
  return selected.filter((item) => {
    if (!item.children) return true
    return !item.children.some((child) => selectedIdsSet.has(child.id))
  })
}

// Drag-select handlers
function handleMouseDown(e: MouseEvent) {
  if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return
  dragStartPosition.value = { x: e.clientX, y: e.clientY }
}

function handleMouseMove(e: MouseEvent) {
  if (!(e.buttons & 1)) {
    isDragging.value = false
    dragStartY.value = null
    dragStartPosition.value = null
    return
  }

  if (!dragStartPosition.value) return

  const deltaX = e.clientX - dragStartPosition.value.x
  const deltaY = e.clientY - dragStartPosition.value.y
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

  if (!isDragging.value) {
    if (distance > DRAG_THRESHOLD) {
      isDragging.value = true
      dragStartY.value = dragStartPosition.value.y

      if (!e.shiftKey && !e.ctrlKey) {
        selectedIds.value = new Set()
        lastSelectedId.value = null
      }
    }
    return
  }

  if (!dragRef.value) return

  const items = Array.from(
    dragRef.value.querySelectorAll('[data-tree-item]'),
  ) as HTMLElement[]

  const startY = dragStartY.value
  const curY = e.clientY
  const [selectionStart, selectionEnd] = [
    Math.min(startY || 0, curY),
    Math.max(startY || 0, curY),
  ]

  const newSelection = new Set(
    e.shiftKey || e.ctrlKey ? Array.from(selectedIds.value) : [],
  )

  items.forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.bottom >= selectionStart && rect.top <= selectionEnd) {
      const id = el.getAttribute('data-id')
      const isClosedFolder = el.getAttribute('data-folder-closed') === 'true'
      const parentFolderClosed = el.closest('[data-folder-closed="true"]')

      if (id && (isClosedFolder || !parentFolderClosed)) {
        newSelection.add(id)
      }
    }
  })

  selectedIds.value = newSelection
  currentMouseY.value = e.clientY
}

function handleMouseUp() {
  isDragging.value = false
  dragStartY.value = null
  dragStartPosition.value = null
}

// Cleanup drag events
watch(isDragging, (dragging) => {
  if (dragging) {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseUp)
  } else {
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('mouseleave', handleMouseUp)
  }
})

// Keyboard handler
function handleKeyDown(event: KeyboardEvent) {
  const visible = getVisibleItems(displayData.value, expandedIds.value)
  if (visible.length === 0) return

  const currentIndex = focusedId.value
    ? visible.findIndex((item) => item.id === focusedId.value)
    : -1

  let handled = true

  switch (event.key) {
    case 'ArrowDown': {
      const nextIndex = Math.min(currentIndex + 1, visible.length - 1)
      focusedId.value = visible[nextIndex]!.id
      break
    }
    case 'ArrowUp': {
      const prevIndex = Math.max(currentIndex - 1, 0)
      focusedId.value = visible[prevIndex]!.id
      break
    }
    case 'ArrowRight': {
      const item = currentIndex >= 0 ? visible[currentIndex] : null
      if (item?.children) {
        if (!expandedIds.value.has(item.id)) {
          handleToggleExpand(item.id, true)
        } else if (item.children.length > 0) {
          focusedId.value = item.children[0]!.id
        }
      }
      break
    }
    case 'ArrowLeft': {
      const item = currentIndex >= 0 ? visible[currentIndex] : null
      if (item?.children && expandedIds.value.has(item.id)) {
        handleToggleExpand(item.id, false)
      } else if (item) {
        // Find parent
        const parent = findParentItem(item.id, props.data)
        if (parent) focusedId.value = parent.id
      }
      break
    }
    case 'Enter': {
      const item = currentIndex >= 0 ? visible[currentIndex] : null
      if (item) {
        handleSelect(item, new MouseEvent('click'))
      }
      break
    }
    case ' ': {
      const item = currentIndex >= 0 ? visible[currentIndex] : null
      if (item && props.showCheckboxes) {
        const state = getCheckState(item, itemMap.value)
        handleCheckChange(item, state !== 'checked')
      }
      break
    }
    case 'Home':
      focusedId.value = visible[0]!.id
      break
    case 'End':
      focusedId.value = visible[visible.length - 1]!.id
      break
    default:
      handled = false
  }

  if (handled) {
    event.preventDefault()
    // Focus the element
    if (focusedId.value) {
      const el = document.querySelector(
        `[data-item-id="${focusedId.value}"]`,
      ) as HTMLElement | null
      el?.focus()
    }
  }
}

function findParentItem(childId: string, items: TreeViewItem[]): TreeViewItem | null {
  for (const item of items) {
    if (item.children?.some((c) => c.id === childId)) return item
    if (item.children) {
      const found = findParentItem(childId, item.children)
      if (found) return found
    }
  }
  return null
}

// Provide state to TreeItem children
provide(TREE_SELECTED_IDS, selectedIds)
provide(TREE_EXPANDED_IDS, expandedIds)
provide(TREE_FOCUSED_ID, focusedId)
provide(TREE_ITEM_MAP, itemMap)
provide(TREE_DATA, toRef(props, 'data'))
provide(TREE_ON_SELECT, handleSelect)
provide(TREE_ON_TOGGLE, handleToggleExpand)
provide(TREE_ON_CHECK, handleCheckChange)
provide(TREE_SHOW_CHECKBOXES, props.showCheckboxes)
provide(TREE_ICON_MAP, props.iconMap || {})
provide(TREE_MENU_ITEMS, props.menuItems || [])
provide(TREE_NODE_ACTIONS, props.nodeActions || {})
provide(TREE_ON_NODE_ACTION, (actionId: string, item: TreeViewItem) => emit('node-action', actionId, item))

// Provide slot render functions for recursive TreeItem usage
const slots = useSlots()
provide(TREE_ICON_SLOT, slots.icon || null)
provide(TREE_LABEL_SLOT, slots.label || null)

function clearSelection() {
  selectedIds.value = new Set()
  lastSelectedId.value = null
}
</script>

<template>
  <div class="flex gap-4">
    <div
      ref="treeRef"
      class="bg-background p-6 rounded-xl border space-y-4 w-full relative shadow-lg"
    >
      <!-- Search bar / Selection bar -->
      <Transition mode="out-in" name="bar">
        <div
          v-if="selectedIds.size > 0"
          key="selection"
          class="h-10 flex items-center justify-between bg-background rounded-lg border px-4"
        >
          <div
            class="font-medium cursor-pointer flex items-center"
            title="Clear selection"
            @click="clearSelection"
          >
            <X class="h-4 w-4 mr-2" />
            {{ selectedIds.size }} {{ selectionText }}
          </div>

          <div v-if="showCheckboxes" class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              class="text-green-600 hover:text-green-700 hover:bg-green-50"
              @click="() => {
                const items = getEffectiveSelectedItems()
                const process = (item: TreeViewItem) => {
                  emit('check-change', item, true)
                  item.children?.forEach(process)
                }
                items.forEach(process)
              }"
            >
              {{ checkboxLabels.check }}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
              @click="() => {
                const items = getEffectiveSelectedItems()
                const process = (item: TreeViewItem) => {
                  emit('check-change', item, false)
                  item.children?.forEach(process)
                }
                items.forEach(process)
              }"
            >
              {{ checkboxLabels.uncheck }}
            </Button>
          </div>
        </div>

        <div v-else key="search" class="h-10 flex items-center gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              :placeholder="searchPlaceholder"
              class="h-10 pl-9"
            />
          </div>
          <div v-if="showExpandAll" class="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" class="h-10 px-2" @click="handleExpandAll">
              <ChevronDown class="h-4 w-4 mr-1" />
              Expand All
            </Button>
            <Button variant="ghost" size="sm" class="h-10 px-2" @click="handleCollapseAll">
              <ChevronRight class="h-4 w-4 mr-1" />
              Collapse All
            </Button>
          </div>
        </div>
      </Transition>

      <!-- Tree container -->
      <div
        ref="dragRef"
        role="tree"
        aria-label="Tree view"
        class="rounded-lg bg-card relative select-none"
        :tabindex="0"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @keydown="handleKeyDown"
      >
        <div v-if="displayData.length === 0" class="py-4 text-center text-muted-foreground text-sm">
          No results found
        </div>
        <TreeItem
          v-for="item in displayData"
          :key="item.id"
          :item="item"
          :depth="0"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar-enter-active,
.bar-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.bar-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.bar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
