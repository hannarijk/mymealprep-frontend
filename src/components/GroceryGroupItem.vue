<script setup lang="ts">
import { ref } from 'vue'
import { Check, Trash2, Plus } from 'lucide-vue-next'
import Pill from '@/components/Pill.vue'
import type { GroceryItem } from '@/types'

const props = defineProps<{ department: string; items: GroceryItem[] }>()
const emit = defineEmits<{
  toggle: [index: number]
  remove: [index: number]
  addItem: [name: string]
}>()

const draft = ref('')

function handleAdd() {
  const name = draft.value.trim()
  if (!name) return
  emit('addItem', name)
  draft.value = ''
}
</script>

<template>
  <div class="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-semibold text-slate-900">{{ department }}</h3>
      <Pill tone="green">{{ items.length }} items</Pill>
    </div>

    <ul class="space-y-2">
      <li
        v-for="(item, i) in items"
        :key="i"
        class="flex items-center gap-3"
      >
        <button
          :class="[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition',
            item.checked
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 hover:border-emerald-400',
          ]"
          @click="emit('toggle', i)"
        >
          <Check v-if="item.checked" class="h-3 w-3" />
        </button>
        <span
          :class="[
            'flex-1 text-sm',
            item.checked ? 'text-slate-400 line-through' : 'text-slate-700',
          ]"
        >{{ item.name }}</span>
        <span v-if="item.amount" class="text-xs text-slate-400">{{ item.amount }}</span>
        <button
          class="text-slate-300 transition hover:text-rose-500"
          @click="emit('remove', i)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </li>
    </ul>

    <div class="mt-4 flex gap-2">
      <input
        v-model="draft"
        type="text"
        placeholder="Add item…"
        class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
        @keydown.enter="handleAdd"
      />
      <button
        class="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
        @click="handleAdd"
      >
        <Plus class="h-3.5 w-3.5" /> Add
      </button>
    </div>
  </div>
</template>
