<script setup lang="ts">
import { computed, watchEffect, onMounted, onUnmounted } from 'vue'
import { X, Clock3, Users, RotateCcw } from 'lucide-vue-next'
import { useRecipeStore } from '@/stores/recipeStore'
import Pill from '@/components/Pill.vue'
import type { MealPlan, Recipe } from '@/types'

const props = defineProps<{ plan: MealPlan | null }>()
const emit = defineEmits<{ close: []; reuse: [plan: MealPlan] }>()

const recipeStore = useRecipeStore()

function resolveRecipes(ids: string[]): Recipe[] {
  return ids
    .map(id => recipeStore.recipes.find(r => r.id === id))
    .filter((r): r is Recipe => r !== undefined)
}

const breakfastRecipes = computed(() =>
  resolveRecipes(props.plan?.recipes?.Breakfast ?? []),
)
const mainRecipes = computed(() =>
  resolveRecipes(props.plan?.recipes?.['Lunch/Dinner'] ?? []),
)
const hasAnyRecipes = computed(
  () => breakfastRecipes.value.length > 0 || mainRecipes.value.length > 0,
)

const formattedDate = computed(() => {
  if (!props.plan?.createdAt) return null
  return new Date(props.plan.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

watchEffect(() => {
  document.body.style.overflow = props.plan !== null ? 'hidden' : ''
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="drawer">
    <div v-if="plan !== null" class="contents">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        @click="emit('close')"
      />

      <!-- Drawer panel -->
      <div
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col overflow-hidden bg-white shadow-2xl"
      >
        <!-- Header -->
        <div class="border-b border-slate-100 px-5 py-4">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">{{ plan.title }}</h2>
            <button
              class="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              @click="emit('close')"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <Pill :tone="plan.type === 'Weekly' ? 'default' : 'purple'">{{ plan.type }}</Pill>
            <Pill v-if="plan.active" tone="green">Current</Pill>
            <span v-if="formattedDate" class="text-xs text-slate-400">{{ formattedDate }}</span>
          </div>
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-5">
          <!-- Notes -->
          <p
            v-if="plan.notes"
            class="mb-5 border-b border-slate-100 pb-5 text-sm italic text-slate-500"
          >
            "{{ plan.notes }}"
          </p>

          <!-- No recipe data fallback -->
          <p v-if="!hasAnyRecipes" class="text-sm italic text-slate-400">
            No recipe details saved for this plan.
          </p>

          <template v-else>
            <!-- Breakfast section -->
            <div v-if="breakfastRecipes.length > 0" class="mb-6">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Breakfast
                </span>
                <span
                  class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                >
                  {{ breakfastRecipes.length }}
                </span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="recipe in breakfastRecipes"
                  :key="recipe.id"
                  class="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
                >
                  <img
                    :src="recipe.imageUrl"
                    :alt="recipe.name"
                    class="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-slate-900">{{ recipe.name }}</p>
                    <div class="mt-0.5 flex gap-3 text-xs text-slate-400">
                      <span class="flex items-center gap-1">
                        <Clock3 class="h-3 w-3" />{{ recipe.timeMinutes }}m
                      </span>
                      <span class="flex items-center gap-1">
                        <Users class="h-3 w-3" />{{ recipe.servings }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lunch/Dinner section -->
            <div v-if="mainRecipes.length > 0">
              <div class="mb-3 flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Lunch / Dinner
                </span>
                <span
                  class="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs text-violet-700"
                >
                  {{ mainRecipes.length }}
                </span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="recipe in mainRecipes"
                  :key="recipe.id"
                  class="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
                >
                  <img
                    :src="recipe.imageUrl"
                    :alt="recipe.name"
                    class="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-slate-900">{{ recipe.name }}</p>
                    <div class="mt-0.5 flex gap-3 text-xs text-slate-400">
                      <span class="flex items-center gap-1">
                        <Clock3 class="h-3 w-3" />{{ recipe.timeMinutes }}m
                      </span>
                      <span class="flex items-center gap-1">
                        <Users class="h-3 w-3" />{{ recipe.servings }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 p-4">
          <span
            v-if="plan.active"
            class="flex w-full items-center justify-center rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700"
          >
            Active plan
          </span>
          <button
            v-else
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
            @click="emit('reuse', plan)"
          >
            <RotateCcw class="h-4 w-4" /> Reuse this plan
          </button>
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
