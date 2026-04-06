<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function submit() {
  isLoading.value = true
  try {
    await authStore.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/plan'
    router.push(redirect)
  } catch {
    // error is set on authStore.error
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p class="mt-1 text-sm text-slate-500">Sign in to your meal plan</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700" for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="••••••••"
          />
        </div>

        <p v-if="authStore.error" class="text-sm text-rose-600">{{ authStore.error }}</p>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {{ isLoading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-500">
        No account?
        <RouterLink to="/register" class="font-medium text-slate-900 hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>
