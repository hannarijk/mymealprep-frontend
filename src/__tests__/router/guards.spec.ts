import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

import { useAuthStore } from '@/stores/authStore'
import router from '@/router'

function mockAuth(isAuthenticated: boolean) {
  vi.mocked(useAuthStore).mockReturnValue({ isAuthenticated } as ReturnType<typeof useAuthStore>)
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('route guards', () => {
  it('unauthenticated user visiting /plan is redirected to /login with redirect param', async () => {
    mockAuth(false)
    await router.push('/plan')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/plan')
  })

  it('unauthenticated user visiting /grocery is redirected to /login', async () => {
    mockAuth(false)
    await router.push('/grocery')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/grocery')
  })

  it('unauthenticated user can access /login', async () => {
    mockAuth(false)
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('unauthenticated user can access /register', async () => {
    mockAuth(false)
    await router.push('/register')
    expect(router.currentRoute.value.path).toBe('/register')
  })

  it('authenticated user visiting /login is redirected to /plan', async () => {
    mockAuth(true)
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/plan')
  })

  it('authenticated user visiting /register is redirected to /plan', async () => {
    mockAuth(true)
    await router.push('/register')
    expect(router.currentRoute.value.path).toBe('/plan')
  })

  it('authenticated user can access /plan', async () => {
    mockAuth(true)
    await router.push('/plan')
    expect(router.currentRoute.value.path).toBe('/plan')
  })
})
