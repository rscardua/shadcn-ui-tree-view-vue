<script setup lang="ts">
import type { DropZone } from './types'

defineProps<{
  zone: DropZone
  depth: number
}>()
</script>

<template>
  <div
    v-if="zone === 'before' || zone === 'after'"
    class="absolute left-0 right-0 h-0.5 bg-blue-500 z-10 pointer-events-none"
    :class="zone === 'before' ? '-top-px' : '-bottom-px'"
    :style="{ marginLeft: `${depth * 20 + 8}px` }"
  >
    <div class="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-blue-500" />
  </div>
</template>
