<template>
  <div class="settings-page p-4">
    <h1 class="text-2xl font-bold mb-6">书签同步设置</h1>

    <div class="settings-card bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold">启用书签同步</h2>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            在所有设备间同步您的书签
          </p>
        </div>
        <UToggle
          v-model="syncEnabledLocal"
          @update:model-value="handleToggleSync"
        />
      </div>

      <div
        v-if="syncEnabledLocal"
        class="sync-info mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between">
          <span>上次同步:</span>
          <span class="font-medium">
            {{ lastSyncTimeLocal ? formatDate(lastSyncTimeLocal) : '从未' }}
          </span>
        </div>

        <div class="mt-4 flex gap-2">
          <UButton
            :loading="isSyncing"
            size="sm"
            color="primary"
            @click="forceSync"
          >
            立即同步
          </UButton>
          <UButton
            color="neutral"
            size="sm"
            @click="handleExport"
          >
            导出书签
          </UButton>
        </div>
      </div>
    </div>

    <div class="export-import-card bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold mb-4">导入/导出书签</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium mb-2">导出书签</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
            将所有书签导出为 JSON 文件
          </p>
          <UButton
            color="primary"
            @click="handleExport"
          >
            导出为 JSON
          </UButton>
        </div>

        <div>
          <h3 class="font-medium mb-2">导入书签</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
            从 JSON 文件导入书签
          </p>
          <UInput
            type="file"
            accept=".json"
            size="sm"
            @change="handleFileImport"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, Ref } from 'vue'
import { useBookmarksStore } from '@/stores/bookmarks.store'
import { bookmarkSyncService } from '@/lib/bookmark-sync.service'

const bookmarksStore = useBookmarksStore()
const { syncEnabled, lastSyncTime, toggleSync, exportBookmarks, importBookmarks } = bookmarksStore

// Local refs for reactivity
const syncEnabledLocal = ref(false)
const lastSyncTimeLocal = ref(0)

// Watch for changes in the store
watch(() => syncEnabled, (newValue) => {
  syncEnabledLocal.value = newValue
})

watch(() => lastSyncTime, (newValue) => {
  lastSyncTimeLocal.value = newValue
})

const isSyncing = ref(false)

// Computed
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Methods
const handleToggleSync = (enabled: boolean) => {
  syncEnabledLocal.value = enabled
  toggleSync(enabled)
}

const forceSync = async () => {
  isSyncing.value = true
  try {
    await bookmarkSyncService.forceSync()
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    isSyncing.value = false
  }
}

const handleExport = () => {
  const data = exportBookmarks()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bookmarks.json'
  a.click()
  URL.revokeObjectURL(url)
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  try {
    const text = await file.text()
    await importBookmarks(text)
    alert('书签导入成功!')
  } catch (error) {
    console.error('Import failed:', error)
    alert('书签导入失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// Lifecycle
onMounted(() => {
  // Start auto-sync if enabled
  if (syncEnabledLocal.value) {
    bookmarkSyncService.startAutoSync()
  }
})
</script>
