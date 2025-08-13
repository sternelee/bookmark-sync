<template>
  <div class="bookmark-tree">
    <ul class="tree-root">
      <BookmarkTreeNode
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { BookmarkNode } from '@/stores/bookmarks.store'

defineProps<{
  nodes: BookmarkNode[]
}>()

defineEmits<{
  (e: 'edit', bookmark: BookmarkNode): void
  (e: 'delete', bookmark: BookmarkNode): void
  (e: 'move', data: { id: string, parentId: string, index?: number }): void
}>()
</script>

<style scoped>
.tree-root {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
