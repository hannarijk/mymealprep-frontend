<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RotateCcw } from 'lucide-vue-next'
import { useHistoryStore } from '@/stores/historyStore'
import Pagination from '@/components/Pagination.vue'
import Pill from '@/components/Pill.vue'

const router = useRouter()
const historyStore = useHistoryStore()

onMounted(() => historyStore.fetch())

async function handleReuse(plan: (typeof historyStore.pagedHistory)[number]) {
  historyStore.reusePlan(plan)
  await router.push('/plan')
}
</script>

<template>
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
        class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
          <div class="flex shrink-0 gap-2">
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
</template>
