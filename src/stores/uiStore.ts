import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', () => {
  const showSuggestions = ref(true)
  const selectedRecipeId = ref<number | null>(null)

  function toggleSuggestions() {
    showSuggestions.value = !showSuggestions.value
  }

  function openRecipe(id: number) {
    selectedRecipeId.value = id
  }

  function closeRecipe() {
    selectedRecipeId.value = null
  }

  return { showSuggestions, selectedRecipeId, toggleSuggestions, openRecipe, closeRecipe }
})
