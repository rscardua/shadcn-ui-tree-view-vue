<script setup lang="ts">
import { ref, computed } from 'vue'
import TreeView from '@/components/tree-view/TreeView.vue'
import type { TreeViewItem, TreeViewMenuItem, TreeViewNodeActionsMap } from '@/components/tree-view/types'
import { demoData } from '@/lib/demo-data'
import { Globe, Folder, FolderOpen, File, Share2, Download, Trash2, Send, Pencil, MapPin, Eye, Package } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const treeData = ref<TreeViewItem[]>(JSON.parse(JSON.stringify(demoData)))
const showRecap = ref(false)
const recursiveSelect = ref(false)
const selectedItems = ref<TreeViewItem[]>([])

const customIconMap = {
  region: Globe,
  store: Folder,
  department: FolderOpen,
  item: File,
}

function getCheckedItems(items: TreeViewItem[]): TreeViewItem[] {
  let checkedItems: TreeViewItem[] = []
  items.forEach((item) => {
    if (item.checked) {
      checkedItems.push(item)
    } else if (item.children) {
      checkedItems = [...checkedItems, ...getCheckedItems(item.children)]
    }
  })
  return checkedItems
}

function handleCheckChange(item: TreeViewItem, checked: boolean) {
  const updateAllChildren = (children: TreeViewItem[], checked: boolean): TreeViewItem[] => {
    return children.map((child) => ({
      ...child,
      checked,
      children: child.children ? updateAllChildren(child.children, checked) : undefined,
    }))
  }

  const updateItem = (treeItems: TreeViewItem[]): TreeViewItem[] => {
    return treeItems.map((currentItem) => {
      if (currentItem.id === item.id) {
        if (recursiveSelect.value && currentItem.children) {
          return {
            ...currentItem,
            checked,
            children: updateAllChildren(currentItem.children, checked),
          }
        }
        return { ...currentItem, checked }
      }
      if (currentItem.children) {
        return { ...currentItem, children: updateItem(currentItem.children) }
      }
      return currentItem
    })
  }

  treeData.value = updateItem(treeData.value)
}

function handleAction(action: string, items: TreeViewItem[]) {
  if (action === 'add_to_shipment' && items.length > 0) {
    items.forEach((i) => handleCheckChange(i, true))
  }
}

function handleSelectionChange(items: TreeViewItem[]) {
  selectedItems.value = items
}

const checkedItems = computed(() => getCheckedItems(treeData.value))

const nodeActions: TreeViewNodeActionsMap = {
  region: [
    { id: 'view', icon: Eye, tooltip: 'View region details', action: (item) => console.log('View region:', item.name) },
    { id: 'locate', icon: MapPin, tooltip: 'Locate on map' },
  ],
  store: [
    { id: 'edit', icon: Pencil, tooltip: 'Edit store', action: (item) => console.log('Edit store:', item.name) },
    { id: 'view', icon: Eye, tooltip: 'View store details' },
    { id: 'delete', icon: Trash2, tooltip: 'Delete store' },
  ],
  item: [
    { id: 'view', icon: Package, tooltip: 'View item details' },
    { id: 'download', icon: Download, tooltip: 'Download item', action: (item) => console.log('Download:', item.name) },
  ],
}

const menuItems: TreeViewMenuItem[] = [
  {
    id: 'add_to_shipment',
    label: 'Add to Shipment',
    icon: Share2,
    action: (items) => items.forEach((i) => handleCheckChange(i, true)),
  },
  {
    id: 'download',
    label: 'Download',
    icon: Download,
    action: (items) => console.log('Downloading:', items),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    action: (items) => console.log('Deleting:', items),
  },
]
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-orange-300">
    <div class="w-full max-w-[1400px] flex items-center justify-center p-8 gap-2">
      <h1 class="text-2xl font-bold">Tree View - Vue 3 Demo</h1>
    </div>

    <main class="w-full max-w-[1400px] px-8 flex flex-row gap-4 min-h-[600px]">
      <div class="flex flex-col gap-4 min-w-0 flex-1">
        <div class="bg-background rounded-xl border p-4 shadow-lg space-y-3">
          <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Options</h2>
          <label class="flex items-center gap-3 text-sm font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              :checked="recursiveSelect"
              class="rounded border-input h-4 w-4"
              @change="recursiveSelect = ($event.target as HTMLInputElement).checked"
            />
            <div>
              <div>Recursive Select</div>
              <div class="text-xs text-muted-foreground font-normal">
                {{ recursiveSelect
                  ? 'Checking a parent automatically checks all descendants'
                  : 'Each node is checked independently'
                }}
              </div>
            </div>
          </label>
        </div>

        <TreeView
          :data="treeData"
          :icon-map="customIconMap"
          :show-checkboxes="true"
          :show-expand-all="true"
          :recursive-select="recursiveSelect"
          :menu-items="menuItems"
          :node-actions="nodeActions"
          @check-change="handleCheckChange"
          @action="handleAction"
          @node-action="(actionId, item) => console.log('Node action:', actionId, 'on', item.name)"
          @selection-change="handleSelectionChange"
        />

        <Button
          v-if="checkedItems.length > 0"
          class="w-full flex gap-2 items-center"
          @click="showRecap = true"
        >
          <Send class="h-4 w-4" />
          Send {{ checkedItems.length }} Items
        </Button>
      </div>

      <div class="flex flex-col flex-1 gap-4">
        <div class="bg-background p-6 rounded-xl border shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Selected Items</h2>
          <div class="border rounded-lg p-4 bg-card font-mono text-sm max-h-[220px] overflow-auto">
            <div v-if="selectedItems.length > 0" class="space-y-1">
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="flex items-center gap-2 py-0.5"
              >
                <component :is="customIconMap[item.type as keyof typeof customIconMap]" class="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span class="truncate">{{ item.name }}</span>
                <span class="text-xs text-muted-foreground ml-auto shrink-0">{{ item.type }}</span>
              </div>
            </div>
            <div v-else class="text-muted-foreground">No items selected</div>
          </div>
        </div>

        <div class="bg-background p-6 rounded-xl border shadow-lg flex-1">
          <h2 class="text-xl font-semibold mb-4">Checked Items</h2>
          <div class="border rounded-lg p-4 bg-card font-mono text-sm h-[calc(100%-4rem)]">
            <pre v-if="checkedItems.length > 0" class="whitespace-pre-wrap break-all overflow-auto max-h-full">{{ JSON.stringify(checkedItems.map((item) => ({ ...item, children: undefined })), null, 2) }}</pre>
            <div v-else class="text-muted-foreground">No items checked</div>
          </div>
        </div>
      </div>
    </main>

    <Dialog :open="showRecap" @update:open="(val) => showRecap = val">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sending {{ checkedItems.length }} Items</DialogTitle>
        </DialogHeader>

        <ScrollArea class="max-h-[60vh] mt-4">
          <div class="space-y-4">
            <div
              v-for="item in checkedItems"
              :key="item.id"
              class="flex items-center gap-2 p-2 border rounded-md"
            >
              <component :is="customIconMap[item.type as keyof typeof customIconMap]" class="h-4 w-4" />
              <span>{{ item.name }}</span>
              <span class="text-sm text-muted-foreground ml-auto">{{ item.type }}</span>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter class="mt-4">
          <Button variant="outline" @click="showRecap = false">Cancel</Button>
          <Button @click="() => { console.log('Sending items:', checkedItems); showRecap = false }">
            Confirm Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <footer class="w-full max-w-[1400px] flex items-center justify-center p-8">
      <a
        href="https://github.com/neigebaie/shadcn-ui-tree-view"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p class="text-sm text-muted-foreground">Tree View - Vue 3 Demo by neigebaie.</p>
      </a>
    </footer>
  </div>
</template>
