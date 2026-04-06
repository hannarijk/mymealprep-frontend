<script setup lang="ts">
import { Heart, Clock3, Users, Plus } from 'lucide-vue-next'
import type { Recipe } from '@/types'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits<{
  quickAdd: [payload: { recipeId: number; section: 'Breakfast' | 'Lunch/Dinner' }]
  view: [id: number]
}>()
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div class="relative">
      <img
        :src="recipe.imageUrl"
        :alt="recipe.name"
        class="h-44 w-full object-cover"
      />
      <Heart
        v-if="recipe.liked"
        class="absolute right-3 top-3 h-4 w-4 fill-rose-500 text-rose-500 drop-shadow"
      />
    </div>
    <div class="flex flex-1 flex-col p-4">
      <p class="font-semibold text-slate-900 leading-tight">{{ recipe.name }}</p>
      <p class="mt-0.5 text-xs text-slate-400">Perfect for {{ recipe.section }}</p>
      <div class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="tag in recipe.tags"
          :key="tag"
          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
        >{{ tag }}</span>
      </div>
      <div class="mt-3 flex items-center gap-3 text-xs text-slate-400">
        <span class="flex items-center gap-1"><Clock3 class="h-3.5 w-3.5" />{{ recipe.timeMinutes }}m</span>
        <span class="flex items-center gap-1"><Users class="h-3.5 w-3.5" />{{ recipe.servings }} servings</span>
      </div>
      <div class="mt-auto flex gap-2 pt-4">
        <button
          class="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          @click="emit('quickAdd', { recipeId: recipe.id, section: recipe.section })"
        >
          <Plus class="h-3.5 w-3.5" /> Add to plan
        </button>
        <button
          class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          @click="emit('view', recipe.id)"
        >
          View
        </button>
      </div>
    </div>
  </div>
</template>
