<template>
  <li class="tree-node">
    <div
      class="node-content flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
      :class="{ 'font-bold': !node.url }"
    >
      <div class="node-info flex items-center flex-1 min-w-0">
        <span
          v-if="hasChildren"
          class="toggle mr-2 cursor-pointer"
          @click="expanded = !expanded"
        >
          <i :class="expanded ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"></i>
        </span>
        <span
          v-else
          class="spacer mr-2 w-4"
        ></span>

        <span
          v-if="node.url"
          class="icon mr-2"
        >
          <i class="i-lucide-link"></i>
        </span>
        <span
          v-else
          class="icon mr-2"
        >
          <i class="i-lucide-folder"></i>
        </span>

        <span
          class="title truncate"
          :title="node.title"
        >{{ node.title }}</span>
      </div>

      <div class="node-actions flex gap-1">
        <UButton
          v-if="node.url"
          icon="i-lucide-external-link"
          size="xs"
          color="neutral"
          variant="ghost"
          @click.stop="openUrl(node.url!)"
        />
        <UButton
          icon="i-lucide-pencil"
          size="xs"
          color="neutral"
          variant="ghost"
          @click.stop="$emit('edit', node)"
        />
        <UButton
          icon="i-lucide-trash-2"
          size="xs"
          color="error"
          variant="ghost"
          @click.stop="$emit('delete', node)"
        />
      </div>
    </div>

    <ul
      v-if="expanded && hasChildren"
      class="children ml-4 border-l border-gray-200 dark:border-gray-700"
    >
      <BookmarkTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @move="$emit('move', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BookmarkNode } from '@/stores/bookmarks.store'

const props = defineProps<{
  node: BookmarkNode
}>()

const emit = defineEmits<{
  (e: 'edit', bookmark: BookmarkNode): void
  (e: 'delete', bookmark: BookmarkNode): void
  (e: 'move', data: { id: string, parentId: string, index?: number }): void
}>()

// Reactive data
const expanded = ref(false)

// Computed
const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0
})

// Methods
const openUrl = (url: string) => {
  window.open(url, '_blank')
}
</script>

<style scoped>
.tree-node {
  list-style: none;
}

.children {
  list-style: none;
  padding: 0;
  margin: 0;
}

.node-content {
  transition: background-color 0.2s;
}

.title {
  flex: 1;
  min-width: 0;
}
</style>
