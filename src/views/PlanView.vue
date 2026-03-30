<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Trash2 } from 'lucide-vue-next'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { useUIStore } from '@/stores/uiStore'
import SectionMealCard from '@/components/SectionMealCard.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import Pill from '@/components/Pill.vue'

const router = useRouter()
const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()
const uiStore = useUIStore()

onMounted(async () => {
  await recipeStore.fetch()
  await mealPlanStore.fetch()
})
</script>

<template>
  <div class="flex min-h-[calc(100vh-152px)] flex-col lg:flex-row">
    <!-- Main content -->
    <main class="min-w-0 flex-1 p-5 lg:border-r lg:border-slate-100">
      <!-- Top bar -->
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-lg font-bold tracking-tight text-slate-900">Current Plan</h2>
        <div class="flex gap-2">
          <button
            class="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600"
            @click="mealPlanStore.clearPlan()"
          >
            <Trash2 class="h-4 w-4" /> Clear
          </button>
          <button
            class="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            @click="router.push('/grocery')"
          >
            <ShoppingCart class="h-4 w-4" /> Grocery list
          </button>
        </div>
      </div>

      <div class="space-y-5">
        <!-- Breakfast section -->
        <section class="rounded-[28px] border border-slate-200 bg-slate-50/50 p-5">
          <div class="mb-4 flex items-center gap-3">
            <h3 class="font-semibold text-slate-900">Breakfast</h3>
            <Pill tone="amber">{{ mealPlanStore.breakfastRecipes.length }}</Pill>
          </div>
          <TransitionGroup name="meal-card" tag="div" class="space-y-3">
            <SectionMealCard
              v-for="recipe in mealPlanStore.breakfastRecipes"
              :key="recipe.id"
              :recipe="recipe"
              @remove="mealPlanStore.removeRecipe($event, 'Breakfast')"
              @view="uiStore.openRecipe($event)"
            />
          </TransitionGroup>
          <div
            v-if="mealPlanStore.breakfastRecipes.length === 0"
            class="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400"
          >
            No breakfasts added yet — pick from suggestions →
          </div>
        </section>

        <!-- Lunch/Dinner section -->
        <section class="rounded-[28px] border border-slate-200 bg-slate-50/50 p-5">
          <div class="mb-4 flex items-center gap-3">
            <h3 class="font-semibold text-slate-900">Lunch / Dinner</h3>
            <Pill tone="purple">{{ mealPlanStore.mainRecipes.length }}</Pill>
          </div>
          <TransitionGroup name="meal-card" tag="div" class="space-y-3">
            <SectionMealCard
              v-for="recipe in mealPlanStore.mainRecipes"
              :key="recipe.id"
              :recipe="recipe"
              @remove="mealPlanStore.removeRecipe($event, 'Lunch/Dinner')"
              @view="uiStore.openRecipe($event)"
            />
          </TransitionGroup>
          <div
            v-if="mealPlanStore.mainRecipes.length === 0"
            class="rounded-2xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400"
          >
            No mains added yet — pick from suggestions →
          </div>
        </section>
      </div>
    </main>

    <!-- Suggestions sidebar -->
    <Transition name="slide-sidebar">
      <aside
        v-if="uiStore.showSuggestions"
        class="w-full shrink-0 overflow-y-auto border-t border-slate-100 p-5 lg:w-[340px] lg:border-t-0"
      >
        <h3 class="mb-4 font-semibold text-slate-900">Suggestions</h3>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-1">
          <SuggestionCard
            v-for="recipe in mealPlanStore.suggestions"
            :key="recipe.id"
            :recipe="recipe"
            @add="mealPlanStore.addRecipe($event.recipeId, $event.section)"
            @view="uiStore.openRecipe($event)"
          />
        </div>
        <p v-if="mealPlanStore.suggestions.length === 0" class="text-sm text-slate-400">
          All recipes are in your current plan.
        </p>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.meal-card-enter-active,
.meal-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.meal-card-enter-from,
.meal-card-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
