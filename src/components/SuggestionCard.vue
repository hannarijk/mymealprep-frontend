<script setup lang="ts">
import { Heart, Clock3, Users, Plus } from 'lucide-vue-next'
import type { Recipe } from '@/types'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{
  add: [payload: { recipeId: number; section: 'Breakfast' | 'Lunch/Dinner' }]
  view: [id: number]
}>()
</script>

<template>
  <div
    class="cursor-pointer rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    @click="emit('view', recipe.id)"
  >
    <img
      :src="recipe.imageUrl"
      :alt="recipe.name"
      class="h-9 w-full rounded-t-2xl object-cover"
    />
    <div class="p-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">{{ recipe.name }}</p>
          <p class="mt-0.5 truncate text-xs text-slate-400">{{ recipe.why }}</p>
        </div>
        <Heart v-if="recipe.liked" class="mt-0.5 h-4 w-4 shrink-0 fill-rose-500 text-rose-500" />
      </div>
      <div class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="tag in recipe.tags.slice(0, 3)"
          :key="tag"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
        >{{ tag }}</span>
      </div>
      <div class="mt-2 flex items-center gap-3 text-xs text-slate-400">
        <span class="flex items-center gap-1"><Clock3 class="h-3.5 w-3.5" />{{ recipe.timeMinutes }}m</span>
        <span class="flex items-center gap-1"><Users class="h-3.5 w-3.5" />{{ recipe.servings }}</span>
      </div>
      <div class="mt-3 flex gap-2" @click.stop>
        <button
          class="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700"
          @click="emit('add', { recipeId: recipe.id, section: 'Breakfast' })"
        >
          <Plus class="h-3.5 w-3.5" /> Breakfast
        </button>
        <button
          class="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700"
          @click="emit('add', { recipeId: recipe.id, section: 'Lunch/Dinner' })"
        >
          <Plus class="h-3.5 w-3.5" /> Lunch/Din
        </button>
      </div>
    </div>
  </div>
</template>
