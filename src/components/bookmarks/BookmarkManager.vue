<template>
  <div class="bookmark-manager">
    <div class="header flex justify-between items-center mb-4">
      <h1 class="text-xl font-bold">书签管理</h1>
      <div class="controls flex gap-2">
        <UButton
          icon="i-lucide-refresh"
          :loading="isLoading"
          size="sm"
          color="neutral"
          @click="refreshBookmarks"
        >
          刷新
        </UButton>
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          @click="showAddDialog = true"
        >
          添加书签
        </UButton>
      </div>
    </div>

    <div
      v-if="error"
      class="error-alert mb-4"
    >
      <UAlert
        type="error"
        :title="error"
        @close="error = null"
      />
    </div>

    <div class="search-bar mb-4">
      <UInput
        v-model="searchQuery"
        placeholder="搜索书签..."
        icon="i-lucide-search"
        size="sm"
      />
    </div>

    <div
      v-if="isLoading"
      class="loading flex justify-center items-center h-32"
    >
      <div class="spinner i-svg-spinners-90-ring-with-bg text-primary"></div>
    </div>

    <div v-else>
      <BookmarkTree
        :nodes="filteredBookmarksTree"
        @edit="handleEdit"
        @delete="handleDelete"
        @move="handleMove"
      />
    </div>

    <!-- Add/Edit Bookmark Dialog -->
    <UModal v-model="showAddDialog">
      <UCard>
        <template #header>
          <h2 class="font-bold">{{ editingBookmark ? '编辑书签' : '添加书签' }}</h2>
        </template>

        <UForm
          :state="bookmarkForm"
          @submit="saveBookmark"
        >
          <UFormGroup
            label="标题"
            name="title"
            class="mb-4"
          >
            <UInput
              v-model="bookmarkForm.title"
              required
            />
          </UFormGroup>

          <UFormGroup
            label="URL"
            name="url"
            class="mb-4"
          >
            <UInput
              v-model="bookmarkForm.url"
              type="url"
            />
          </UFormGroup>

          <UFormGroup
            label="父级文件夹"
            name="parentId"
            class="mb-4"
          >
            <USelect
              v-model="bookmarkForm.parentId"
              :options="folderOptions"
              option-attribute="title"
              value-attribute="id"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              @click="showAddDialog = false"
            >
              取消
            </UButton>
            <UButton
              type="submit"
              color="primary"
            >
              保存
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBookmarksStore, type BookmarkNode } from '@/stores/bookmarks.store'

const bookmarksStore = useBookmarksStore()

const {
  bookmarksTree,
  isLoading,
  error,
  allBookmarks,
  bookmarkFolders,
  loadBookmarks,
  createBookmark,
  updateBookmark,
  removeBookmark,
  moveBookmark,
  searchBookmarks
} = bookmarksStore

// Reactive data
const searchQuery = ref('')
const showAddDialog = ref(false)
const editingBookmark = ref<BookmarkNode | null>(null)
const bookmarkForm = ref({
  title: '',
  url: '',
  parentId: '1' // Default to "书签栏" folder
})

// Computed
const filteredBookmarksTree = computed(() => {
  if (!searchQuery.value) {
    return bookmarksTree
  }

  // For simplicity, we'll just filter the flat list of bookmarks
  // A more complete implementation would filter the tree structure
  return bookmarksTree
})

const folderOptions = computed(() => {
  return [
    { id: '1', title: '书签栏' },
    { id: '2', title: '其他书签' },
    ...bookmarkFolders.map((folder: BookmarkNode) => ({
      id: folder.id,
      title: folder.title
    }))
  ]
})

// Methods
const refreshBookmarks = async () => {
  await loadBookmarks()
}

const handleEdit = (bookmark: BookmarkNode) => {
  editingBookmark.value = bookmark
  bookmarkForm.value = {
    title: bookmark.title,
    url: bookmark.url || '',
    parentId: bookmark.parentId || '1'
  }
  showAddDialog.value = true
}

const handleDelete = async (bookmark: BookmarkNode) => {
  if (confirm(`确定要删除 "${bookmark.title}" 吗?`)) {
    try {
      await removeBookmark(bookmark.id)
    } catch (err) {
      console.error('Failed to delete bookmark:', err)
    }
  }
}

const handleMove = async (data: { id: string, parentId: string, index?: number }) => {
  try {
    await moveBookmark(data.id, { parentId: data.parentId, index: data.index })
  } catch (err) {
    console.error('Failed to move bookmark:', err)
  }
}

const saveBookmark = async () => {
  try {
    if (editingBookmark.value) {
      // Update existing bookmark
      await updateBookmark(editingBookmark.value.id, {
        title: bookmarkForm.value.title,
        url: bookmarkForm.value.url
      })
    } else {
      // Create new bookmark
      await createBookmark({
        title: bookmarkForm.value.title,
        url: bookmarkForm.value.url,
        parentId: bookmarkForm.value.parentId
      })
    }

    // Reset form and close dialog
    bookmarkForm.value = {
      title: '',
      url: '',
      parentId: '1'
    }
    showAddDialog.value = false
    editingBookmark.value = null
  } catch (err) {
    console.error('Failed to save bookmark:', err)
  }
}

// Lifecycle
onMounted(async () => {
  await loadBookmarks()
})
</script>

<style scoped>
.bookmark-manager {
  padding: 1rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
}
</style>
