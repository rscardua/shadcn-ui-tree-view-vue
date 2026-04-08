<script setup lang="ts">
import { computed, inject } from 'vue'
import type { TreeViewItem } from './types'
import {
  TREE_DATA,
  TREE_EXPANDED_IDS,
  TREE_FOCUSED_ID,
  TREE_ICON_MAP,
  TREE_ICON_SLOT,
  TREE_ITEM_MAP,
  TREE_LABEL_SLOT,
  TREE_MENU_ITEMS,
  TREE_ON_CHECK,
  TREE_ON_SELECT,
  TREE_ON_TOGGLE,
  TREE_SELECTED_IDS,
  TREE_SHOW_CHECKBOXES,
} from './keys'
import { getCheckState, getItemPath, getSelectedChildrenCount, getVisibleItems } from './utils'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronRight, Folder, Info } from '@lucide/vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  item: TreeViewItem
  depth: number
}>()

// Inject shared state
const selectedIds = inject(TREE_SELECTED_IDS)!
const expandedIds = inject(TREE_EXPANDED_IDS)!
const focusedId = inject(TREE_FOCUSED_ID)!
const itemMap = inject(TREE_ITEM_MAP)!
const data = inject(TREE_DATA)!
const onSelect = inject(TREE_ON_SELECT)!
const onToggle = inject(TREE_ON_TOGGLE)!
const onCheck = inject(TREE_ON_CHECK)!
const showCheckboxes = inject(TREE_SHOW_CHECKBOXES, false)
const iconMap = inject(TREE_ICON_MAP, {})
const menuItems = inject(TREE_MENU_ITEMS, [])
const iconSlot = inject(TREE_ICON_SLOT, null)
const labelSlot = inject(TREE_LABEL_SLOT, null)

// Computed
const isOpen = computed(() => expandedIds.value.has(props.item.id))
const isSelected = computed(() => selectedIds.value.has(props.item.id))
const isFocused = computed(() => focusedId.value === props.item.id)

const checkState = computed(() => getCheckState(props.item, itemMap.value))

const selectedCount = computed(() => {
  if (!props.item.children || isOpen.value) return null
  const count = getSelectedChildrenCount(props.item, selectedIds.value)
  return count > 0 ? count : null
})

const selectionStyle = computed(() => {
  if (!isSelected.value) return ''
  const visible = getVisibleItems(data.value, expandedIds.value)
  const currentIndex = visible.findIndex((i) => i.id === props.item.id)
  const prevItem = visible[currentIndex - 1]
  const nextItem = visible[currentIndex + 1]
  const isPrevSelected = prevItem && selectedIds.value.has(prevItem.id)
  const isNextSelected = nextItem && selectedIds.value.has(nextItem.id)
  const roundTop = !isPrevSelected
  const roundBottom = !isNextSelected
  return `${roundTop ? 'rounded-t-md' : ''} ${roundBottom ? 'rounded-b-md' : ''}`
})

const formattedType = computed(() => {
  return props.item.type.charAt(0).toUpperCase() + props.item.type.slice(1).replace('_', ' ')
})

const itemPath = computed(() => getItemPath(props.item, data.value))

// Handlers
function handleClick(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
  onSelect(props.item, e)
}

function handleAccessClick(e: MouseEvent) {
  e.stopPropagation()
  const newChecked = checkState.value !== 'checked'
  onCheck(props.item, newChecked)
}

function handleContextMenuAction(menuItemAction: (items: TreeViewItem[]) => void) {
  if (selectedIds.value.has(props.item.id)) {
    const items: TreeViewItem[] = []
    const processItem = (item: TreeViewItem) => {
      if (selectedIds.value.has(item.id)) items.push(item)
      item.children?.forEach(processItem)
    }
    data.value.forEach(processItem)
    menuItemAction(items)
  } else {
    menuItemAction([props.item])
  }
}

function renderIcon() {
  return iconMap[props.item.type] || iconMap['folder'] || Folder
}
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger as-child>
      <div>
        <div
          data-tree-item
          :data-id="item.id"
          :data-item-id="item.id"
          :data-depth="depth"
          :data-folder-closed="item.children && !isOpen ? 'true' : undefined"
          role="treeitem"
          :aria-expanded="item.children ? isOpen : undefined"
          :aria-selected="isSelected"
          :aria-checked="showCheckboxes ? (checkState === 'indeterminate' ? 'mixed' : checkState === 'checked') : undefined"
          :tabindex="isFocused ? 0 : -1"
          :class="cn(
            'select-none cursor-pointer px-1',
            isSelected ? `bg-orange-100 ${selectionStyle}` : 'text-foreground',
          )"
          :style="{ paddingLeft: `${depth * 20}px` }"
          @click="handleClick"
        >
          <div class="flex items-center min-h-8">
            <!-- Folder item -->
            <template v-if="item.children">
              <div class="flex items-center gap-2 flex-1 group">
                <Button variant="ghost" size="icon" class="h-6 w-6" @click.stop="() => onToggle(item.id, !isOpen)">
                  <div
                    class="transition-transform duration-100"
                    :class="isOpen ? 'rotate-90' : 'rotate-0'"
                  >
                    <ChevronRight class="h-4 w-4" />
                  </div>
                </Button>

                <!-- Checkbox -->
                <div
                  v-if="showCheckboxes"
                  class="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:opacity-80"
                  @click.stop="handleAccessClick"
                >
                  <div v-if="checkState === 'checked'" class="w-4 h-4 border rounded bg-primary border-primary flex items-center justify-center">
                    <svg class="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-else-if="checkState === 'unchecked'" class="w-4 h-4 border rounded border-input" />
                  <div v-else class="w-4 h-4 border rounded bg-primary border-primary flex items-center justify-center">
                    <div class="h-0.5 w-2 bg-primary-foreground" />
                  </div>
                </div>

                <!-- Icon -->
                <component :is="() => iconSlot?.({ item, depth })" v-if="iconSlot" />
                <component v-else :is="renderIcon()" class="h-4 w-4 text-primary/80" />

                <!-- Name -->
                <component :is="() => labelSlot?.({ item })" v-if="labelSlot" />
                <span v-else class="flex-1">{{ item.name }}</span>

                <!-- Selected count badge -->
                <Badge
                  v-if="selectedCount"
                  variant="secondary"
                  class="mr-2 bg-blue-100 hover:bg-blue-100"
                >
                  {{ selectedCount }} selected
                </Badge>

                <!-- Hover card -->
                <HoverCard>
                  <HoverCardTrigger as-child>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-6 w-6 p-0 group-hover:opacity-100 opacity-0 items-center justify-center"
                      @click.stop
                    >
                      <Info class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent class="w-80">
                    <div class="space-y-2">
                      <h4 class="text-sm font-semibold">{{ item.name }}</h4>
                      <div class="text-sm text-muted-foreground space-y-1">
                        <div><span class="font-medium">Type:</span> {{ formattedType }}</div>
                        <div><span class="font-medium">ID:</span> {{ item.id }}</div>
                        <div><span class="font-medium">Location:</span> {{ itemPath }}</div>
                        <div><span class="font-medium">Items:</span> {{ item.children?.length || 0 }} direct items</div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </template>

            <!-- Leaf item -->
            <template v-else>
              <div class="flex items-center gap-2 flex-1 pl-8 group">
                <!-- Checkbox -->
                <div
                  v-if="showCheckboxes"
                  class="relative flex items-center justify-center w-4 h-4 cursor-pointer hover:opacity-80"
                  @click.stop="handleAccessClick"
                >
                  <div v-if="item.checked" class="w-4 h-4 border rounded bg-primary border-primary flex items-center justify-center">
                    <svg class="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div v-else class="w-4 h-4 border rounded border-input" />
                </div>

                <!-- Icon -->
                <component :is="() => iconSlot?.({ item, depth })" v-if="iconSlot" />
                <component v-else :is="renderIcon()" class="h-4 w-4 text-primary/80" />

                <!-- Name -->
                <component :is="() => labelSlot?.({ item })" v-if="labelSlot" />
                <span v-else class="flex-1">{{ item.name }}</span>

                <!-- Hover card -->
                <HoverCard>
                  <HoverCardTrigger as-child>
                    <Button
                      variant="ghost"
                      size="sm"
                      class="h-6 w-6 p-0 group-hover:opacity-100 opacity-0 items-center justify-center"
                      @click.stop
                    >
                      <Info class="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent class="w-80">
                    <div class="space-y-2">
                      <h4 class="text-sm font-semibold">{{ item.name }}</h4>
                      <div class="text-sm text-muted-foreground space-y-1">
                        <div><span class="font-medium">Type:</span> {{ formattedType }}</div>
                        <div><span class="font-medium">ID:</span> {{ item.id }}</div>
                        <div><span class="font-medium">Location:</span> {{ itemPath }}</div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </template>
          </div>
        </div>

        <!-- Children (collapsible) -->
        <div v-if="item.children" role="group" class="overflow-hidden">
          <Collapsible :open="isOpen" @update:open="(open: boolean) => onToggle(item.id, open)">
            <CollapsibleContent>
              <!-- @vue-ignore -->
              <TreeItem
                v-for="child in item.children"
                :key="child.id"
                :item="child"
                :depth="depth + 1"
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </ContextMenuTrigger>

    <ContextMenuContent class="w-64">
      <ContextMenuItem
        v-for="menuItem in menuItems"
        :key="menuItem.id"
        @click="handleContextMenuAction(menuItem.action)"
      >
        <span v-if="menuItem.icon" class="mr-2 h-4 w-4">
          <component :is="menuItem.icon" class="h-4 w-4" />
        </span>
        {{ menuItem.label }}
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
