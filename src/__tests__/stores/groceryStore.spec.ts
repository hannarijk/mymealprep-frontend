import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGroceryStore } from '@/stores/groceryStore'
import type { GroceryGroup } from '@/types'

vi.mock('@/services/groceryService', () => ({
  fetchGrocery: vi.fn(),
  toggleGroceryItem: vi.fn().mockResolvedValue(undefined),
  removeGroceryItem: vi.fn().mockResolvedValue(undefined),
  addGroceryItem: vi.fn(),
}))

import { fetchGrocery, toggleGroceryItem, removeGroceryItem, addGroceryItem } from '@/services/groceryService'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('groceryStore', () => {
  it('fetch populates grocery groups', async () => {
    const mock: GroceryGroup = {
      Produce: [{ id: 'p-1', name: 'Spinach', amount: '300g', checked: false }],
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

  it('toggleItem flips checked and calls toggleGroceryItem', async () => {
    const store = useGroceryStore()
    store.grocery = { Produce: [{ id: 'p-1', name: 'Spinach', amount: '300g', checked: false }] }
    await store.toggleItem('Produce', 0)
    expect(store.grocery['Produce']?.[0]?.checked).toBe(true)
    expect(toggleGroceryItem).toHaveBeenCalledWith('p-1', true)
  })

  it('toggleItem reverts on service failure', async () => {
    vi.mocked(toggleGroceryItem).mockRejectedValueOnce(new Error('Network error'))
    const store = useGroceryStore()
    store.grocery = { Produce: [{ id: 'p-1', name: 'Spinach', amount: '', checked: false }] }
    await store.toggleItem('Produce', 0)
    expect(store.grocery['Produce']?.[0]?.checked).toBe(false)
  })

  it('toggleItem does nothing for out-of-bounds index', async () => {
    const store = useGroceryStore()
    store.grocery = { Produce: [] }
    await expect(store.toggleItem('Produce', 99)).resolves.not.toThrow()
  })

  it('toggleItem does nothing for unknown department', async () => {
    const store = useGroceryStore()
    store.grocery = {}
    await expect(store.toggleItem('Unknown', 0)).resolves.not.toThrow()
  })

  it('removeItem removes item and calls removeGroceryItem', async () => {
    const store = useGroceryStore()
    store.grocery = {
      Produce: [
        { id: 'p-1', name: 'Spinach', amount: '', checked: false },
        { id: 'p-2', name: 'Kale', amount: '', checked: false },
      ],
    }
    await store.removeItem('Produce', 0)
    expect(store.grocery['Produce']).toHaveLength(1)
    expect(store.grocery['Produce']?.[0]?.name).toBe('Kale')
    expect(removeGroceryItem).toHaveBeenCalledWith('p-1')
  })

  it('removeItem restores item on service failure', async () => {
    vi.mocked(removeGroceryItem).mockRejectedValueOnce(new Error('Network error'))
    const store = useGroceryStore()
    store.grocery = {
      Produce: [{ id: 'p-1', name: 'Spinach', amount: '', checked: false }],
    }
    await store.removeItem('Produce', 0)
    expect(store.grocery['Produce']).toHaveLength(1)
  })

  it('addItem appends item returned by service with server UUID', async () => {
    vi.mocked(addGroceryItem).mockResolvedValue({ id: 'server-uuid', name: 'Olive oil', amount: '', checked: false })
    const store = useGroceryStore()
    store.grocery = { Pantry: [] }
    await store.addItem('Pantry', 'Olive oil')
    expect(addGroceryItem).toHaveBeenCalledWith('Olive oil', '', 'Pantry')
    expect(store.grocery['Pantry']?.[0]?.id).toBe('server-uuid')
    expect(store.grocery['Pantry']?.[0]?.name).toBe('Olive oil')
  })

  it('invalidate resets grocery state and allows fetch to run again', async () => {
    vi.mocked(fetchGrocery).mockResolvedValue({ Produce: [{ id: 'p-1', name: 'Spinach', amount: '', checked: false }] })
    const store = useGroceryStore()
    await store.fetch()
    expect(fetchGrocery).toHaveBeenCalledTimes(1)
    store.invalidate()
    await store.fetch()
    expect(fetchGrocery).toHaveBeenCalledTimes(2)
    expect(store.departments).toContain('Produce')
  })

  it('totalItems sums items across all departments', () => {
    const store = useGroceryStore()
    store.grocery = {
      Produce: [
        { id: 'p-1', name: 'Spinach', amount: '', checked: false },
        { id: 'p-2', name: 'Kale', amount: '', checked: false },
      ],
      Dairy: [
        { id: 'd-1', name: 'Eggs', amount: '', checked: false },
        { id: 'd-2', name: 'Milk', amount: '', checked: false },
        { id: 'd-3', name: 'Cheese', amount: '', checked: false },
      ],
    }
    expect(store.totalItems).toBe(5)
  })
})
