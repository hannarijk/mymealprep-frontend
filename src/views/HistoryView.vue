<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw, Trash2 } from 'lucide-vue-next'
import { useHistoryStore } from '@/stores/historyStore'
import { deletePlan as deletePlanService } from '@/services/mealPlanService'
import Pagination from '@/components/Pagination.vue'
import Pill from '@/components/Pill.vue'
import type { MealPlan } from '@/types'

const router = useRouter()
const historyStore = useHistoryStore()

onMounted(() => historyStore.fetch())

async function handleReuse(plan: (typeof historyStore.pagedHistory)[number]) {
  historyStore.reusePlan(plan)
  await router.push('/plan')
}

// ── Deferred delete with undo ──────────────────────────────────────────────
const pendingDelete = ref<MealPlan | null>(null)
const showDeleteToast = ref(false)
let deleteTimer: ReturnType<typeof setTimeout> | null = null

function commitPendingDelete() {
  if (!pendingDelete.value) return
  deletePlanService(pendingDelete.value.id).catch(() => {})
  pendingDelete.value = null
}

function handleDelete(plan: MealPlan) {
  if (pendingDelete.value) commitPendingDelete()
  historyStore.removeFromHistory(plan.id)
  pendingDelete.value = plan
  showDeleteToast.value = true
  if (deleteTimer) clearTimeout(deleteTimer)
  deleteTimer = setTimeout(dismissDeleteToast, 5000)
}

function handleUndoDelete() {
  if (!pendingDelete.value) return
  historyStore.restoreToHistory(pendingDelete.value)
  if (deleteTimer) { clearTimeout(deleteTimer); deleteTimer = null }
  pendingDelete.value = null
  showDeleteToast.value = false
}

function dismissDeleteToast() {
  commitPendingDelete()
  showDeleteToast.value = false
  deleteTimer = null
}

onUnmounted(() => {
  if (deleteTimer) commitPendingDelete()
})
</script>

<template>
  <div>
  <div class="p-5">
    <div class="mb-5">
      <h2 class="text-lg font-bold tracking-tight text-slate-900">Plan History</h2>
      <p class="mt-1 text-sm text-slate-500">Browse and reuse your past meal plans</p>
    </div>

    <!-- Loading state -->
    <div v-if="historyStore.isLoading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="h-32 animate-pulse rounded-[28px] bg-slate-100" />
    </div>

    <!-- Error state -->
    <div v-else-if="historyStore.error" class="py-12 text-center text-sm text-rose-500">
      {{ historyStore.error }}
    </div>

    <!-- History list -->
    <div v-else class="space-y-4">
      <div
        v-for="plan in historyStore.pagedHistory"
        :key="plan.id"
        class="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="min-w-0">
            <div class="mb-2 flex flex-wrap items-center gap-2">
              <h3 class="font-semibold text-slate-900">{{ plan.title }}</h3>
              <Pill :tone="plan.type === 'Weekly' ? 'default' : 'purple'">{{ plan.type }}</Pill>
              <Pill v-if="plan.active" tone="green">Current</Pill>
            </div>
            <div class="flex gap-4 text-sm text-slate-500">
              <span>{{ plan.breakfasts }} breakfast{{ plan.breakfasts !== 1 ? 's' : '' }}</span>
              <span>{{ plan.mains }} main{{ plan.mains !== 1 ? 's' : '' }}</span>
            </div>
            <p v-if="plan.sourcePlanId" class="mt-1 text-xs text-slate-400">
              ↩ from {{ historyStore.history.find(p => p.id === plan.sourcePlanId)?.title ?? 'another plan' }}
            </p>
            <p v-if="plan.notes" class="mt-1.5 text-sm text-slate-500 italic">
              "{{ plan.notes }}"
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <button
              v-if="!plan.active"
              class="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              @click="handleReuse(plan)"
            >
              <RotateCcw class="h-4 w-4" /> Reuse
            </button>
            <span v-else class="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Active plan
            </span>
            <button
              v-if="!plan.active"
              class="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
              aria-label="Delete plan"
              @click="handleDelete(plan)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="historyStore.totalHistoryPages > 1" class="mt-6">
      <Pagination
        :page="historyStore.historyPage"
        :total-pages="historyStore.totalHistoryPages"
        @prev="historyStore.prevPage()"
        @next="historyStore.nextPage()"
      />
    </div>
  </div>

  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="showDeleteToast"
        class="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg"
      >
        <span>Plan deleted</span>
        <button
          class="font-semibold text-emerald-400 transition hover:text-emerald-300"
          @click="handleUndoDelete"
        >
          Undo
        </button>
      </div>
    </Transition>
  </Teleport>
  </div>
</template>

<style scoped>
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
