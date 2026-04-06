import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchGrocery, updateGrocery } from '@/services/groceryService'
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
    if (isLoading.value || Object.keys(grocery.value).length > 0) return
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

  function toggleItem(department: string, index: number) {
    const items = grocery.value[department] ?? []
    const item = items[index]
    if (item) {
      item.checked = !item.checked
      updateGrocery(grocery.value).catch(() => {})
    }
  }

  function removeItem(department: string, index: number) {
    const items = grocery.value[department] ?? []
    grocery.value[department] = items.filter((_, i) => i !== index)
    updateGrocery(grocery.value).catch(() => {})
  }

  function addItem(department: string, name: string) {
    const items = grocery.value[department] ?? []
    grocery.value[department] = [...items, { id: '', name, amount: '', checked: false }]
    updateGrocery(grocery.value).catch(() => {})
  }

  return { grocery, isLoading, error, departments, totalItems, fetch, toggleItem, removeItem, addItem }
})
