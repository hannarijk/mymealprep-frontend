<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{ page: number; totalPages: number }>()
const emit = defineEmits<{ prev: []; next: [] }>()
</script>

<template>
  <div class="flex items-center justify-between pt-2">
    <button
      :disabled="page === 1"
      class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      @click="emit('prev')"
    >
      <ChevronLeft class="h-4 w-4" />
      Previous
    </button>
    <span class="text-sm text-slate-500">Page {{ page }} of {{ totalPages }}</span>
    <button
      :disabled="page === totalPages"
      class="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      @click="emit('next')"
    >
      Next
      <ChevronRight class="h-4 w-4" />
    </button>
  </div>
</template>
