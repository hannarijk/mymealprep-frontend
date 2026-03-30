<script setup lang="ts">
import { computed, watchEffect, onUnmounted, onMounted } from 'vue'
import { X, Clock3, Users, Heart, Check, Plus } from 'lucide-vue-next'
import { useUIStore } from '@/stores/uiStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { useMealPlanStore } from '@/stores/mealPlanStore'

const uiStore = useUIStore()
const recipeStore = useRecipeStore()
const mealPlanStore = useMealPlanStore()

const recipe = computed(() =>
  recipeStore.recipes.find((r) => r.id === uiStore.selectedRecipeId) ?? null,
)

const isInBreakfast = computed(() =>
  recipe.value ? mealPlanStore.currentPlan.Breakfast.includes(recipe.value.id) : false,
)

const isInMains = computed(() =>
  recipe.value
    ? mealPlanStore.currentPlan['Lunch/Dinner'].includes(recipe.value.id)
    : false,
)

// Body scroll lock
watchEffect(() => {
  document.body.style.overflow = uiStore.selectedRecipeId !== null ? 'hidden' : ''
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Escape key to close
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') uiStore.closeRecipe()
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Transition name="drawer">
    <div v-if="uiStore.selectedRecipeId !== null && recipe" class="contents">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        @click="uiStore.closeRecipe()"
      />
      <!-- Drawer panel -->
      <div class="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden bg-white shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 class="font-semibold text-slate-900">Recipe Details</h2>
          <button
            class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            @click="uiStore.closeRecipe()"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto">
          <!-- Hero image -->
          <img
            :src="recipe.image"
            :alt="recipe.name"
            class="h-60 w-full object-cover"
          />

          <div class="p-5">
            <!-- Name + liked -->
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-xl font-bold tracking-tight text-slate-900">{{ recipe.name }}</h3>
              <Heart
                v-if="recipe.liked"
                class="mt-1 h-5 w-5 shrink-0 fill-rose-500 text-rose-500"
              />
            </div>

            <!-- Why -->
            <p class="mt-1 text-sm text-slate-500">{{ recipe.why }}</p>

            <!-- Meta -->
            <div class="mt-3 flex flex-wrap gap-2">
              <span class="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <Clock3 class="h-3.5 w-3.5" />{{ recipe.time }} min
              </span>
              <span class="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Users class="h-3.5 w-3.5" />{{ recipe.servings }} servings
              </span>
              <span class="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                {{ recipe.section }}
              </span>
            </div>

            <!-- Tags -->
            <div class="mt-3 flex flex-wrap gap-1.5">
              <span
                v-for="tag in recipe.tags"
                :key="tag"
                class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500"
              >{{ tag }}</span>
            </div>

            <!-- Add to plan -->
            <div class="mt-5 flex gap-2">
              <button
                :disabled="isInBreakfast"
                :class="[
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isInBreakfast
                    ? 'bg-emerald-50 text-emerald-700 cursor-default border border-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-slate-700',
                ]"
                @click="mealPlanStore.addRecipe(recipe!.id, 'Breakfast')"
              >
                <Check v-if="isInBreakfast" class="h-4 w-4" />
                <Plus v-else class="h-4 w-4" />
                {{ isInBreakfast ? 'In Breakfast' : 'Add to Breakfast' }}
              </button>
              <button
                :disabled="isInMains"
                :class="[
                  'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isInMains
                    ? 'bg-violet-50 text-violet-700 cursor-default border border-violet-200'
                    : 'bg-slate-900 text-white hover:bg-slate-700',
                ]"
                @click="mealPlanStore.addRecipe(recipe!.id, 'Lunch/Dinner')"
              >
                <Check v-if="isInMains" class="h-4 w-4" />
                <Plus v-else class="h-4 w-4" />
                {{ isInMains ? 'In Lunch/Din' : 'Add to Lunch/Din' }}
              </button>
            </div>

            <!-- Ingredients -->
            <div class="mt-6">
              <h4 class="mb-3 font-semibold text-slate-900">Ingredients</h4>
              <ul class="space-y-2">
                <li
                  v-for="(ingredient, i) in recipe.ingredients"
                  :key="i"
                  class="flex items-center gap-2.5 text-sm text-slate-700"
                >
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {{ ingredient }}
                </li>
              </ul>
            </div>

            <!-- Steps -->
            <div class="mt-6 pb-6">
              <h4 class="mb-3 font-semibold text-slate-900">Instructions</h4>
              <ol class="space-y-3">
                <li
                  v-for="(step, i) in recipe.steps"
                  :key="i"
                  class="flex gap-3 text-sm text-slate-700"
                >
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {{ i + 1 }}
                  </span>
                  <span class="pt-0.5">{{ step }}</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
