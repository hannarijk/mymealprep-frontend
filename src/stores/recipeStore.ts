import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { fetchRecipes } from '@/services/recipeService'
import { filterRecipes, paginateItems } from '@/utils/recipeUtils'
import type { Recipe } from '@/types'

const RECIPES_PER_PAGE = 8

export const useRecipeStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const search = ref('')
  const recipePage = ref(1)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filteredRecipes = computed(() => filterRecipes(recipes.value, search.value))

  const totalRecipePages = computed(() =>
    Math.max(1, Math.ceil(filteredRecipes.value.length / RECIPES_PER_PAGE)),
  )

  const pagedRecipes = computed(() =>
    paginateItems(filteredRecipes.value, recipePage.value, RECIPES_PER_PAGE),
  )

  async function fetch() {
    if (isLoading.value || recipes.value.length > 0) return
    isLoading.value = true
    error.value = null
    try {
      recipes.value = await fetchRecipes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load recipes'
    } finally {
      isLoading.value = false
    }
  }

  function setSearch(q: string) {
    search.value = q
    recipePage.value = 1
  }

  function prevPage() {
    recipePage.value = Math.max(1, recipePage.value - 1)
  }

  function nextPage() {
    recipePage.value = Math.min(totalRecipePages.value, recipePage.value + 1)
  }

  return {
    recipes,
    search,
    recipePage,
    isLoading,
    error,
    filteredRecipes,
    totalRecipePages,
    pagedRecipes,
    fetch,
    setSearch,
    prevPage,
    nextPage,
  }
})
