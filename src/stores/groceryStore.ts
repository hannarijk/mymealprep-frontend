import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchGrocery,
  toggleGroceryItem,
  removeGroceryItem,
  addGroceryItem,
} from '@/services/groceryService'
import type { GroceryGroup } from '@/types'

export const useGroceryStore = defineStore('grocery', () => {
  const grocery = ref<GroceryGroup>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const departments = computed(() => Object.keys(grocery.value))

  const totalItems = computed(() =>
    Object.values(grocery.value).reduce((sum, items) => sum + items.length, 0),
  )

  async function fetch() {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null
    try {
      grocery.value = await fetchGrocery()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load grocery list'
    } finally {
      isLoading.value = false
    }
  }

  async function toggleItem(department: string, index: number) {
    const item = grocery.value[department]?.[index]
    if (!item) return
    const previous = item.checked
    item.checked = !previous
    try {
      await toggleGroceryItem(item.id, item.checked)
    } catch {
      item.checked = previous
    }
  }

  async function removeItem(department: string, index: number) {
    const items = grocery.value[department] ?? []
    const item = items[index]
    if (!item) return
    const snapshot = [...items]
    grocery.value[department] = items.filter((_, i) => i !== index)
    try {
      await removeGroceryItem(item.id)
    } catch {
      grocery.value[department] = snapshot
    }
  }

  async function addItem(department: string, name: string) {
    const item = await addGroceryItem(name, '', department)
    const items = grocery.value[department] ?? []
    grocery.value[department] = [...items, item]
  }

  return {
    grocery,
    isLoading,
    error,
    departments,
    totalItems,
    fetch,
    toggleItem,
    removeItem,
    addItem,
  }
})
