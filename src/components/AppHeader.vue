<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CalendarRange, BookOpen, ShoppingCart, History, PanelRightOpen, PanelRightClose, LogOut } from 'lucide-vue-next'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const authStore = useAuthStore()

const tabs = [
  { path: '/plan', label: 'Plan', icon: CalendarRange },
  { path: '/recipes', label: 'Recipes', icon: BookOpen },
  { path: '/grocery', label: 'Grocery', icon: ShoppingCart },
  { path: '/history', label: 'History', icon: History },
]

const isOnPlan = computed(() => route.path === '/plan')
const avatarInitials = computed(() =>
  authStore.user?.email.slice(0, 2).toUpperCase() ?? '?',
)

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-slate-100 bg-[#fcfcfb]/80 backdrop-blur">
    <div class="flex items-center justify-between px-5 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
          <span class="text-xs font-bold text-white">M</span>
        </div>
        <span class="font-semibold text-slate-900">MyMealPrep</span>
      </div>

      <!-- Nav tabs -->
      <nav class="hidden items-center rounded-xl bg-slate-100 p-1 sm:flex">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          :class="[
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
            route.path === tab.path
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900',
          ]"
        >
          <component :is="tab.icon" class="h-4 w-4" />
          {{ tab.label }}
        </RouterLink>
      </nav>

      <!-- Right controls -->
      <div class="flex items-center gap-2">
        <!-- Suggestions toggle (plan tab only) -->
        <button
          v-if="isOnPlan"
          class="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          :title="uiStore.showSuggestions ? 'Hide suggestions' : 'Show suggestions'"
          @click="uiStore.toggleSuggestions()"
        >
          <PanelRightClose v-if="uiStore.showSuggestions" class="h-5 w-5" />
          <PanelRightOpen v-else class="h-5 w-5" />
        </button>

        <!-- Avatar -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold text-white"
          style="background: radial-gradient(circle at 30% 30%, #6366f1, #312e81)"
          :title="authStore.user?.email"
        >
          {{ avatarInitials }}
        </div>

        <!-- Logout -->
        <button
          class="rounded-xl border border-slate-200 p-1.5 text-slate-500 transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500"
          title="Log out"
          @click="logout"
        >
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Mobile nav -->
    <nav class="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
          route.path === tab.path
            ? 'bg-slate-900 text-white'
            : 'text-slate-500 hover:text-slate-900',
        ]"
      >
        <component :is="tab.icon" class="h-4 w-4" />
        {{ tab.label }}
      </RouterLink>
    </nav>
  </header>
</template>
