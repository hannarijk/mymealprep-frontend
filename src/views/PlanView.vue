<script setup lang="ts">
import { ref, nextTick, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2, Pencil, PlusCircle } from 'lucide-vue-next'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { useUIStore } from '@/stores/uiStore'
import SectionMealCard from '@/components/SectionMealCard.vue'
import SuggestionCard from '@/components/SuggestionCard.vue'
import Pill from '@/components/Pill.vue'
import type { CurrentPlan } from '@/types'
import { defaultPlanTitle } from '@/utils/planUtils'

const router = useRouter()
const mealPlanStore = useMealPlanStore()
const recipeStore = useRecipeStore()
const uiStore = useUIStore()

// ── Title inline-edit ──────────────────────────────────────────────────────
const editingTitle = ref(false)
const draftTitle = ref('')
const titleInput = useTemplateRef<HTMLInputElement>('titleInput')
const titleMirror = useTemplateRef<HTMLSpanElement>('titleMirror')

function startEdit() {
  draftTitle.value = mealPlanStore.planTitle || 'My Meal Plan'
  editingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

async function saveTitle() {
  const trimmed = draftTitle.value.trim()
  if (trimmed && trimmed !== mealPlanStore.planTitle) {
    await mealPlanStore.renameActivePlan(trimmed)
  }
  editingTitle.value = false
}

function cancelEdit() {
  editingTitle.value = false
}

// ── Clear with undo toast ──────────────────────────────────────────────────
const undoClearSnapshot = ref<CurrentPlan | null>(null)
const showUndoToast = ref(false)
let undoTimer: ReturnType<typeof setTimeout> | null = null

function handleClear() {
  undoClearSnapshot.value = {
    Breakfast: [...mealPlanStore.currentPlan.Breakfast],
    'Lunch/Dinner': [...mealPlanStore.currentPlan['Lunch/Dinner']],
  }
  mealPlanStore.clearPlan()
  showUndoToast.value = true
  if (undoTimer) clearTimeout(undoTimer)
  undoTimer = setTimeout(dismissUndoToast, 5000)
}

function handleUndoClear() {
  if (!undoClearSnapshot.value) return
  mealPlanStore.restorePlan(undoClearSnapshot.value)
  dismissUndoToast()
}

function dismissUndoToast() {
  showUndoToast.value = false
  undoClearSnapshot.value = null
  if (undoTimer) { clearTimeout(undoTimer); undoTimer = null }
}

// ── New plan with history toast ────────────────────────────────────────────
const showHistoryToast = ref(false)
let historyTimer: ReturnType<typeof setTimeout> | null = null


async function handleNewPlan() {
  await mealPlanStore.createPlan(defaultPlanTitle())
  showHistoryToast.value = true
  if (historyTimer) clearTimeout(historyTimer)
  historyTimer = setTimeout(() => { showHistoryToast.value = false }, 4000)
}

onUnmounted(() => {
  if (undoTimer) clearTimeout(undoTimer)
  if (historyTimer) clearTimeout(historyTimer)
})

onMounted(async () => {
  await recipeStore.fetch()
  await mealPlanStore.fetch()
})
</script>

<template>
  <div>
  <div class="flex min-h-[calc(100vh-152px)] flex-col lg:flex-row">
    <!-- Main content -->
    <main class="min-w-0 flex-1 p-5 lg:border-r lg:border-slate-100">
      <!-- Top bar -->
      <div class="mb-5 flex items-center justify-between">
        <!-- Plan title + type: skeleton → view → edit -->
        <div class="min-w-0">
          <div v-if="mealPlanStore.isLoading" class="h-7 w-40 animate-pulse rounded-lg bg-slate-200" />

          <div v-else-if="!editingTitle" class="flex items-center gap-2">
            <div
              class="group flex cursor-pointer items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              tabindex="0"
              role="button"
              :aria-label="`Edit plan name: ${mealPlanStore.planTitle || 'My Meal Plan'}`"
              @click="startEdit"
              @keydown.enter="startEdit"
            >
              <h2 class="text-lg font-bold tracking-tight text-slate-900">
                {{ mealPlanStore.planTitle || 'My Meal Plan' }}
              </h2>
              <Pencil
                class="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
                aria-hidden="true"
              />
            </div>
            <button
              class="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              @click="mealPlanStore.togglePlanType()"
            >
              <Pill :tone="mealPlanStore.planType === 'Weekly' ? 'default' : 'purple'">
                {{ mealPlanStore.planType }}
              </Pill>
            </button>
          </div>

          <div v-else class="flex flex-col">
            <div class="relative flex items-center">
              <!-- Hidden mirror for input auto-sizing -->
              <span
                ref="titleMirror"
                class="invisible absolute text-lg font-bold tracking-tight whitespace-pre"
                aria-hidden="true"
              >{{ draftTitle || ' ' }}</span>
              <input
                ref="titleInput"
                v-model="draftTitle"
                :style="{ width: titleMirror ? `${titleMirror.offsetWidth}px` : 'auto' }"
                class="min-w-20 border-b-2 border-slate-300 bg-transparent text-lg font-bold tracking-tight text-slate-900 outline-none transition-colors focus:border-slate-700"
                aria-label="Plan name"
                @blur="saveTitle"
                @keyup.enter="saveTitle"
                @keyup.escape="cancelEdit"
              />
            </div>
            <p v-if="mealPlanStore.renameError" class="mt-1 text-xs text-rose-500">
              {{ mealPlanStore.renameError }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Clear (ghost — destructive, infrequent) -->
          <button
            class="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            @click="handleClear"
          >
            <Trash2 class="h-4 w-4" /> Clear
          </button>

          <!-- New Plan (primary) -->
          <button
            class="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            @click="handleNewPlan"
          >
            <PlusCircle class="h-4 w-4" /> New Plan
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

  <Teleport to="body">
    <!-- Undo toast (Clear) -->
    <Transition name="toast">
      <div
        v-if="showUndoToast"
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
      >
        <span>Plan cleared</span>
        <button
          class="font-semibold text-emerald-400 transition hover:text-emerald-300"
          @click="handleUndoClear"
        >
          Undo
        </button>
      </div>
    </Transition>

    <!-- Info toast (New Plan) -->
    <Transition name="toast">
      <div
        v-if="showHistoryToast"
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
      >
        <span>Previous plan saved to History</span>
        <button
          class="font-semibold text-emerald-400 transition hover:text-emerald-300"
          @click="router.push('/history'); showHistoryToast = false"
        >
          View →
        </button>
      </div>
    </Transition>
  </Teleport>
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

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
