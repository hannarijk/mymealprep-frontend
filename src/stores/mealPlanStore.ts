import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useRecipeStore } from '@/stores/recipeStore'
import { fetchCurrentPlan, updatePlan, clonePlan, createPlan as createPlanService } from '@/services/mealPlanService'
import { getSuggestions } from '@/utils/mealPlanUtils'
import type { CurrentPlan, MealPlan, Recipe } from '@/types'

export const useMealPlanStore = defineStore('mealPlan', () => {
  const recipeStore = useRecipeStore()

  const currentPlan = ref<CurrentPlan>({ Breakfast: [], 'Lunch/Dinner': [] })
  const planType = ref<'Weekly' | 'Biweekly'>('Weekly')
  const planTitle = ref<string>('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const renameError = ref<string | null>(null)

  const breakfastRecipes = computed(() =>
    currentPlan.value.Breakfast.map((id) => recipeStore.recipes.find((r) => r.id === id)).filter(
      (r): r is Recipe => r !== undefined,
    ),
  )

  const mainRecipes = computed(() =>
    currentPlan.value['Lunch/Dinner']
      .map((id) => recipeStore.recipes.find((r) => r.id === id))
      .filter((r): r is Recipe => r !== undefined),
  )

  const suggestions = computed(() => {
    const selectedIds = new Set([
      ...currentPlan.value.Breakfast,
      ...currentPlan.value['Lunch/Dinner'],
    ])
    return getSuggestions(recipeStore.recipes, selectedIds)
  })

  async function fetch() {
    if (isLoading.value) return
    isLoading.value = true
    error.value = null
    try {
      const result = await fetchCurrentPlan()
      currentPlan.value = result.recipes
      planTitle.value = result.title
      planType.value = result.type
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load meal plan'
    } finally {
      isLoading.value = false
    }
  }

  function addRecipe(recipeId: string, section: keyof CurrentPlan) {
    if (currentPlan.value[section].includes(recipeId)) return
    currentPlan.value[section].push(recipeId)
    updatePlan(currentPlan.value).catch(() => {})
  }

  function removeRecipe(recipeId: string, section: keyof CurrentPlan) {
    currentPlan.value[section] = currentPlan.value[section].filter((id) => id !== recipeId)
    updatePlan(currentPlan.value).catch(() => {})
  }

  function togglePlanType() {
    planType.value = planType.value === 'Weekly' ? 'Biweekly' : 'Weekly'
    updatePlan(currentPlan.value, { type: planType.value }).catch(() => {})
  }

  function clearPlan() {
    currentPlan.value = { Breakfast: [], 'Lunch/Dinner': [] }
    updatePlan(currentPlan.value).catch(() => {})
  }

  async function reusePlan(plan: MealPlan) {
    const result = await clonePlan(plan.id, `${plan.title} (copy)`)
    currentPlan.value = result.recipes
    planTitle.value = result.title
  }

  async function createPlan(title: string) {
    const result = await createPlanService(title)
    currentPlan.value = result.recipes
    planTitle.value = result.title
    planType.value = result.type
  }

  function restorePlan(snapshot: CurrentPlan) {
    currentPlan.value = snapshot
    updatePlan(snapshot).catch(() => {})
  }

  async function renameActivePlan(title: string) {
    const previous = planTitle.value
    planTitle.value = title
    renameError.value = null
    try {
      await updatePlan(currentPlan.value, { title })
    } catch {
      planTitle.value = previous
      renameError.value = 'Failed to save name. Please try again.'
    }
  }

  return {
    currentPlan,
    planType,
    planTitle,
    isLoading,
    error,
    renameError,
    breakfastRecipes,
    mainRecipes,
    suggestions,
    fetch,
    addRecipe,
    removeRecipe,
    togglePlanType,
    clearPlan,
    reusePlan,
    createPlan,
    restorePlan,
    renameActivePlan,
  }
})
