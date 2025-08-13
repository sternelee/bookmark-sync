<script setup lang="ts">
import { useBookmarksStore } from '@/stores/bookmarks.store'

const bookmarksStore = useBookmarksStore()
const { syncEnabled, lastSyncTime } = bookmarksStore

const openSidePanel = () => {
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })
}
</script>

<template>
  <div class="w-80 p-4">
    <div class="text-center mb-4">
      <h1 class="text-xl font-bold">书签管理器</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        管理和同步您的书签
      </p>
    </div>

    <div class="space-y-3">
      <UButton
        @click="openSidePanel"
        icon="i-lucide-bookmark"
        size="lg"
        block
      >
        打开书签管理器
      </UButton>
      
      <UButton
        to="/action-popup/playground"
        icon="ph:list-heart"
        variant="subtle"
        block
      >
        功能演示
      </UButton>
      
      <UButton
        to="/common/account/login"
        icon="ph:rocket-launch"
        variant="subtle"
        block
      >
        账户登录
      </UButton>
    </div>

    <div class="mt-6 text-center">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <div v-if="syncEnabled" class="flex items-center justify-center gap-1">
          <i class="i-lucide-check-circle text-green-500"></i>
          <span>同步已启用</span>
        </div>
        <div v-else class="flex items-center justify-center gap-1">
          <i class="i-lucide-x-circle text-red-500"></i>
          <span>同步已禁用</span>
        </div>
        <div v-if="lastSyncTime" class="mt-1">
          上次同步: {{ new Date(lastSyncTime).toLocaleTimeString() }}
        </div>
      </div>
    </div>

    <div class="flex justify-evenly my-4 text-xs">
      <a href="https://github.com/mubaidr/vite-vue3-browser-extension-v3" target="_blank">
        文档
      </a>
      <a href="https://mubaidr.js.org" target="_blank">
        支持
      </a>
    </div>
  </div>
</template>

<style scoped></style>
