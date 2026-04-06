import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { client } from '@/api/client'
import type { ApiAuthResponse } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<{ id: string; email: string } | null>(null)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => token.value !== null)

  function setSession(response: ApiAuthResponse) {
    token.value = response.token
    user.value = response.user
    localStorage.setItem('auth_token', response.token)
  }

  async function login(email: string, password: string) {
    error.value = null
    try {
      const response = await client.post<ApiAuthResponse>('/auth/login', { email, password })
      setSession(response)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Login failed'
      throw e
    }
  }

  async function register(email: string, password: string) {
    error.value = null
    try {
      const response = await client.post<ApiAuthResponse>('/auth/register', { email, password })
      setSession(response)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Registration failed'
      throw e
    }
  }

  function logout() {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem('auth_token')
  }

  return { token, user, error, isAuthenticated, login, register, logout }
})
