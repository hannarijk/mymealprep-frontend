import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { fetchPlanHistory } from '@/services/mealPlanService'
import { paginateItems } from '@/utils/recipeUtils'
import type { MealPlan } from '@/types'

const HISTORY_PER_PAGE = 4

export const useHistoryStore = defineStore('history', () => {
  const history = ref<MealPlan[]>([])
  const historyPage = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const totalHistoryPages = computed(() =>
    Math.max(1, Math.ceil(history.value.length / HISTORY_PER_PAGE)),
  )

  const pagedHistory = computed(() =>
    paginateItems(history.value, historyPage.value, HISTORY_PER_PAGE),
  )

  async function fetch() {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null
    try {
      history.value = await fetchPlanHistory()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load history'
    } finally {
      isLoading.value = false
    }
  }

  function prevPage() {
    historyPage.value = Math.max(1, historyPage.value - 1)
  }

  function nextPage() {
    historyPage.value = Math.min(totalHistoryPages.value, historyPage.value + 1)
  }

  async function reusePlan(plan: MealPlan) {
    const mealPlanStore = useMealPlanStore()
    await mealPlanStore.reusePlan(plan)
  }

  return {
    history,
    historyPage,
    isLoading,
    error,
    totalHistoryPages,
    pagedHistory,
    fetch,
    prevPage,
    nextPage,
    reusePlan,
  }
})
