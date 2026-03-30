import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGroceryStore } from '@/stores/groceryStore'
import type { GroceryGroup } from '@/types'

vi.mock('@/services/groceryService', () => ({
  fetchGrocery: vi.fn(),
  updateGrocery: vi.fn().mockResolvedValue(undefined),
}))

import { fetchGrocery } from '@/services/groceryService'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('groceryStore', () => {
  it('fetch populates grocery groups', async () => {
    const mock: GroceryGroup = {
      Produce: [{ name: 'Spinach', amount: '300g', checked: false }],
    }
    vi.mocked(fetchGrocery).mockResolvedValue(mock)
    const store = useGroceryStore()
    await store.fetch()
    expect(store.departments).toContain('Produce')
  })

  it('fetch is a no-op when grocery already loaded', async () => {
    vi.mocked(fetchGrocery).mockResolvedValue({ Produce: [] })
    const store = useGroceryStore()
    await store.fetch()
    await store.fetch()
    expect(fetchGrocery).toHaveBeenCalledTimes(1)
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(fetchGrocery).mockRejectedValue(new Error('Network error'))
    const store = useGroceryStore()
    await store.fetch()
    expect(store.error).toBe('Network error')
  })

  it('toggleItem flips checked state', () => {
    const store = useGroceryStore()
    store.grocery = { Produce: [{ name: 'Spinach', amount: '300g', checked: false }] }
    store.toggleItem('Produce', 0)
    expect(store.grocery['Produce']?.[0]?.checked).toBe(true)
    store.toggleItem('Produce', 0)
    expect(store.grocery['Produce']?.[0]?.checked).toBe(false)
  })

  it('toggleItem does nothing for out-of-bounds index', () => {
    const store = useGroceryStore()
    store.grocery = { Produce: [] }
    expect(() => store.toggleItem('Produce', 99)).not.toThrow()
  })

  it('toggleItem does nothing for unknown department', () => {
    const store = useGroceryStore()
    store.grocery = {}
    expect(() => store.toggleItem('Unknown', 0)).not.toThrow()
  })

  it('removeItem removes the item at the given index', () => {
    const store = useGroceryStore()
    store.grocery = {
      Produce: [
        { name: 'Spinach', amount: '', checked: false },
        { name: 'Kale', amount: '', checked: false },
      ],
    }
    store.removeItem('Produce', 0)
    expect(store.grocery['Produce']).toHaveLength(1)
    expect(store.grocery['Produce']?.[0]?.name).toBe('Kale')
  })

  it('addItem appends a new unchecked item', () => {
    const store = useGroceryStore()
    store.grocery = { Pantry: [] }
    store.addItem('Pantry', 'Olive oil')
    const items = store.grocery['Pantry']
    expect(items).toHaveLength(1)
    expect(items?.[0]).toEqual({ name: 'Olive oil', amount: '', checked: false })
  })

  it('totalItems sums items across all departments', () => {
    const store = useGroceryStore()
    store.grocery = {
      Produce: [
        { name: 'Spinach', amount: '', checked: false },
        { name: 'Kale', amount: '', checked: false },
      ],
      Dairy: [
        { name: 'Eggs', amount: '', checked: false },
        { name: 'Milk', amount: '', checked: false },
        { name: 'Cheese', amount: '', checked: false },
      ],
    }
    expect(store.totalItems).toBe(5)
  })
})
