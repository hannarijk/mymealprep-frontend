<script setup lang="ts">
import { onMounted } from 'vue'
import { useGroceryStore } from '@/stores/groceryStore'
import GroceryGroupItem from '@/components/GroceryGroupItem.vue'
import Pill from '@/components/Pill.vue'

const groceryStore = useGroceryStore()

onMounted(() => groceryStore.fetch())
</script>

<template>
  <div class="p-5">
    <div class="mb-5 flex items-center gap-3">
      <h2 class="text-lg font-bold tracking-tight text-slate-900">Grocery List</h2>
      <Pill tone="green">{{ groceryStore.totalItems }} items</Pill>
    </div>

    <!-- Loading state -->
    <div v-if="groceryStore.isLoading" class="grid gap-5 xl:grid-cols-2">
      <div v-for="i in 4" :key="i" class="h-48 animate-pulse rounded-[28px] bg-slate-100" />
    </div>

    <!-- Error state -->
    <div v-else-if="groceryStore.error" class="py-12 text-center text-sm text-rose-500">
      {{ groceryStore.error }}
    </div>

    <!-- Grocery groups -->
    <div v-else class="grid gap-5 xl:grid-cols-2">
      <GroceryGroupItem
        v-for="dept in groceryStore.departments"
        :key="dept"
        :department="dept"
        :items="groceryStore.grocery[dept] ?? []"
        @toggle="groceryStore.toggleItem(dept, $event)"
        @remove="groceryStore.removeItem(dept, $event)"
        @add-item="groceryStore.addItem(dept, $event)"
      />
    </div>
  </div>
</template>
