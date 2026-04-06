import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ApiError } from '@/api/client'

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return {
    ...actual,
    client: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { client } from '@/api/client'
import { useAuthStore } from '@/stores/authStore'

const mockAuthResponse = {
  token: 'test-jwt-token',
  user: { id: 'user-1', email: 'test@example.com' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('authStore', () => {
  it('isAuthenticated is false initially when no token in localStorage', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when token exists in localStorage', () => {
    localStorage.setItem('auth_token', 'existing-token')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
  })

  it('login sets token and user on success', async () => {
    vi.mocked(client.post).mockResolvedValue(mockAuthResponse)
    const store = useAuthStore()
    await store.login('test@example.com', 'password123')
    expect(store.token).toBe('test-jwt-token')
    expect(store.user).toEqual({ id: 'user-1', email: 'test@example.com' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('login writes token to localStorage', async () => {
    vi.mocked(client.post).mockResolvedValue(mockAuthResponse)
    const store = useAuthStore()
    await store.login('test@example.com', 'password123')
    expect(localStorage.getItem('auth_token')).toBe('test-jwt-token')
  })

  it('login sets error and re-throws on ApiError', async () => {
    vi.mocked(client.post).mockRejectedValue(new ApiError(401, 'Invalid credentials'))
    const store = useAuthStore()
    await expect(store.login('bad@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(store.error).toBe('Invalid credentials')
    expect(store.isAuthenticated).toBe(false)
  })

  it('register sets token and user on success', async () => {
    vi.mocked(client.post).mockResolvedValue(mockAuthResponse)
    const store = useAuthStore()
    await store.register('new@example.com', 'password123')
    expect(store.token).toBe('test-jwt-token')
    expect(store.user).toEqual({ id: 'user-1', email: 'test@example.com' })
  })

  it('register writes token to localStorage', async () => {
    vi.mocked(client.post).mockResolvedValue(mockAuthResponse)
    const store = useAuthStore()
    await store.register('new@example.com', 'password123')
    expect(localStorage.getItem('auth_token')).toBe('test-jwt-token')
  })

  it('register sets error and re-throws on ApiError', async () => {
    vi.mocked(client.post).mockRejectedValue(new ApiError(409, 'Email already exists'))
    const store = useAuthStore()
    await expect(store.register('existing@example.com', 'pass')).rejects.toThrow('Email already exists')
    expect(store.error).toBe('Email already exists')
  })

  it('logout clears token, user, and localStorage', async () => {
    vi.mocked(client.post).mockResolvedValue(mockAuthResponse)
    const store = useAuthStore()
    await store.login('test@example.com', 'password123')
    store.logout()
    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('auth_token')).toBeNull()
  })
})
