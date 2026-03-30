<script setup lang="ts">
import { GripVertical, Clock3, Users, Trash2 } from 'lucide-vue-next'
import type { Recipe } from '@/types'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{ remove: [id: number]; view: [id: number] }>()
</script>

<template>
  <div
    class="group flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    @click="emit('view', recipe.id)"
  >
    <GripVertical class="h-4 w-4 shrink-0 text-slate-300" />
    <img
      :src="recipe.image"
      :alt="recipe.name"
      class="h-14 w-14 shrink-0 rounded-xl object-cover"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-slate-900">{{ recipe.name }}</p>
      <div class="mt-1 flex flex-wrap gap-1">
        <span
          v-for="tag in recipe.tags.slice(0, 3)"
          :key="tag"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
        >{{ tag }}</span>
      </div>
    </div>
    <div class="hidden shrink-0 items-center gap-3 sm:flex">
      <span class="flex items-center gap-1 text-xs text-slate-400">
        <Clock3 class="h-3.5 w-3.5" />{{ recipe.time }}m
      </span>
      <span class="flex items-center gap-1 text-xs text-slate-400">
        <Users class="h-3.5 w-3.5" />{{ recipe.servings }}
      </span>
    </div>
    <button
      class="ml-1 shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
      @click.stop="emit('remove', recipe.id)"
    >
      <Trash2 class="h-4 w-4" />
    </button>
  </div>
</template>
