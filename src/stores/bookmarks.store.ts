import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBrowserSyncStorage } from '@/composables/useBrowserStorage'
import { bookmarkSyncService } from '@/lib/bookmark-sync.service'

export interface BookmarkNode {
  id: string
  title: string
  url?: string
  children?: BookmarkNode[]
  parentId?: string
  index?: number
  dateAdded?: number
  dateGroupModified?: number
}

export const useBookmarksStore = defineStore('bookmarks', () => {
  // State
  const bookmarksTree = ref<BookmarkNode[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Storage for synced settings
  const syncEnabledRef = useBrowserSyncStorage<boolean>('bookmarkSyncEnabled', false)
  const lastSyncTimeRef = useBrowserSyncStorage<number>('bookmarkLastSyncTime', 0)

  // Getters
  const allBookmarks = computed<BookmarkNode[]>(() => {
    const result: BookmarkNode[] = []

    const traverse = (nodes: BookmarkNode[]) => {
      nodes.forEach(node => {
        if (node.url) {
          result.push(node)
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(bookmarksTree.value)
    return result
  })

  const bookmarkFolders = computed<BookmarkNode[]>(() => {
    const result: BookmarkNode[] = []

    const traverse = (nodes: BookmarkNode[]) => {
      nodes.forEach(node => {
        if (!node.url) {
          result.push(node)
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(bookmarksTree.value)
    return result
  })

  // Actions
  const loadBookmarks = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Using the Web Extensions bookmarks API
      const tree = await browser.bookmarks.getTree()
      bookmarksTree.value = tree as BookmarkNode[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load bookmarks'
      console.error('Error loading bookmarks:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createBookmark = async (bookmark: Omit<BookmarkNode, 'id'>) => {
    try {
      const result = await browser.bookmarks.create({
        title: bookmark.title,
        url: bookmark.url,
        parentId: bookmark.parentId,
        index: bookmark.index
      })

      // Refresh the bookmarks tree
      await loadBookmarks()

      // Sync if enabled
      if (syncEnabledRef.data.value) {
        await bookmarkSyncService.syncBookmarks()
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create bookmark'
      console.error('Error creating bookmark:', err)
      throw err
    }
  }

  const updateBookmark = async (id: string, changes: Partial<BookmarkNode>) => {
    try {
      const result = await browser.bookmarks.update(id, {
        title: changes.title,
        url: changes.url
      })

      // Refresh the bookmarks tree
      await loadBookmarks()

      // Sync if enabled
      if (syncEnabledRef.data.value) {
        await bookmarkSyncService.syncBookmarks()
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update bookmark'
      console.error('Error updating bookmark:', err)
      throw err
    }
  }

  const removeBookmark = async (id: string) => {
    try {
      await browser.bookmarks.remove(id)

      // Refresh the bookmarks tree
      await loadBookmarks()

      // Sync if enabled
      if (syncEnabledRef.data.value) {
        await bookmarkSyncService.syncBookmarks()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove bookmark'
      console.error('Error removing bookmark:', err)
      throw err
    }
  }

  const moveBookmark = async (id: string, destination: { parentId: string, index?: number }) => {
    try {
      await browser.bookmarks.move(id, {
        parentId: destination.parentId,
        index: destination.index
      })

      // Refresh the bookmarks tree
      await loadBookmarks()

      // Sync if enabled
      if (syncEnabledRef.data.value) {
        await bookmarkSyncService.syncBookmarks()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to move bookmark'
      console.error('Error moving bookmark:', err)
      throw err
    }
  }

  const searchBookmarks = async (query: string) => {
    try {
      const results = await browser.bookmarks.search(query)
      return results as BookmarkNode[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search bookmarks'
      console.error('Error searching bookmarks:', err)
      throw err
    }
  }

  const exportBookmarks = () => {
    // Return a JSON representation of the bookmarks tree
    return JSON.stringify(bookmarksTree.value, null, 2)
  }

  const importBookmarks = async (data: string) => {
    try {
      const importedTree = JSON.parse(data) as BookmarkNode[]
      // For now, we'll just replace the current tree
      // In a real implementation, you'd want to merge or replace based on user preference
      bookmarksTree.value = importedTree
      await loadBookmarks()

      // Sync if enabled
      if (syncEnabledRef.data.value) {
        await bookmarkSyncService.syncBookmarks()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to import bookmarks'
      console.error('Error importing bookmarks:', err)
      throw err
    }
  }

  const toggleSync = async (enabled: boolean) => {
    syncEnabledRef.data.value = enabled

    if (enabled) {
      // Start auto-sync when enabled
      bookmarkSyncService.startAutoSync()
      // Force an immediate sync
      await bookmarkSyncService.forceSync()
    } else {
      // Stop auto-sync when disabled
      bookmarkSyncService.stopAutoSync()
    }
  }

  return {
    // State
    bookmarksTree,
    isLoading,
    error,
    syncEnabled: syncEnabledRef.data,
    lastSyncTime: lastSyncTimeRef.data,

    // Getters
    allBookmarks,
    bookmarkFolders,

    // Actions
    loadBookmarks,
    createBookmark,
    updateBookmark,
    removeBookmark,
    moveBookmark,
    searchBookmarks,
    exportBookmarks,
    importBookmarks,
    toggleSync
  }
})
