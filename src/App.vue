<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import RecipeDrawer from '@/components/RecipeDrawer.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <div class="mx-auto min-h-screen max-w-[1600px] p-4 lg:p-6">
      <div
        class="overflow-hidden rounded-[28px] border border-slate-200 bg-[#fcfcfb] shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <AppHeader />
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </div>
  <RecipeDrawer />
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
