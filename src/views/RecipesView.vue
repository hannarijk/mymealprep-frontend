<script setup lang="ts">
import { onMounted } from 'vue'
import { Search } from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipeStore'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { useUIStore } from '@/stores/uiStore'
import RecipeLibraryCard from '@/components/RecipeLibraryCard.vue'
import Pagination from '@/components/Pagination.vue'
import Pill from '@/components/Pill.vue'

const recipeStore = useRecipeStore()
const mealPlanStore = useMealPlanStore()
const uiStore = useUIStore()

onMounted(() => recipeStore.fetch())

const filterPills = ['All', 'Breakfast', 'Lunch/Dinner', 'Quick', 'Meal-prep', 'Vegan', 'High protein']
</script>

<template>
  <div class="p-5">
    <!-- Header -->
    <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-lg font-bold tracking-tight text-slate-900">Recipe Library</h2>
      <!-- Search -->
      <div class="relative max-w-sm flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          :value="recipeStore.search"
          type="text"
          placeholder="Search recipes…"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
          @input="recipeStore.setSearch(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- Filter pills (display only — real filtering coming with API) -->
    <div class="mb-5 flex flex-wrap gap-2">
      <Pill
        v-for="pill in filterPills"
        :key="pill"
        :tone="pill === 'All' ? 'default' : 'default'"
        class="cursor-pointer select-none"
      >{{ pill }}</Pill>
    </div>

    <!-- Loading state -->
    <div v-if="recipeStore.isLoading" class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="h-72 animate-pulse rounded-2xl bg-slate-100"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="recipeStore.error" class="py-12 text-center text-sm text-rose-500">
      {{ recipeStore.error }}
    </div>

    <!-- Recipe grid -->
    <template v-else>
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <RecipeLibraryCard
          v-for="recipe in recipeStore.pagedRecipes"
          :key="recipe.id"
          :recipe="recipe"
          @quickAdd="mealPlanStore.addRecipe($event.recipeId, $event.section)"
          @view="uiStore.openRecipe($event)"
        />
      </div>

      <div v-if="recipeStore.filteredRecipes.length === 0" class="py-12 text-center text-sm text-slate-400">
        No recipes match "{{ recipeStore.search }}"
      </div>

      <div v-if="recipeStore.totalRecipePages > 1" class="mt-6">
        <Pagination
          :page="recipeStore.recipePage"
          :total-pages="recipeStore.totalRecipePages"
          @prev="recipeStore.prevPage()"
          @next="recipeStore.nextPage()"
        />
      </div>
    </template>
  </div>
</template>
