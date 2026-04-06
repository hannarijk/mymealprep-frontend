import { describe, it, expect, vi } from 'vitest'
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
import { fetchGrocery, toggleGroceryItem, removeGroceryItem, addGroceryItem } from '@/services/groceryService'
import type { ApiGroceryList, ApiGroceryItem } from '@/api/types'

const makeApiList = (): ApiGroceryList => ({
  id: 'list-1',
  mealPlanId: 'plan-1',
  departments: {
    Produce: [{ id: 'p-1', name: 'Spinach', amount: '300g', department: 'Produce', checked: false, manual: false }],
    Dairy: [{ id: 'd-1', name: 'Eggs', amount: '6', department: 'Dairy', checked: true, manual: false }],
  },
  generatedAt: '2024-01-01T00:00:00Z',
})

describe('groceryService', () => {
  describe('fetchGrocery', () => {
    it('calls GET /grocery and maps to GroceryGroup', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiList())
      const result = await fetchGrocery()
      expect(client.get).toHaveBeenCalledWith('/grocery')
      expect(result['Produce']).toHaveLength(1)
      expect(result['Produce']?.[0]?.name).toBe('Spinach')
      expect(result['Dairy']?.[0]?.checked).toBe(true)
    })

    it('returns empty GroceryGroup on 404', async () => {
      vi.mocked(client.get).mockRejectedValue(new ApiError(404, 'Not found'))
      const result = await fetchGrocery()
      expect(result).toEqual({})
    })

    it('re-throws non-404 errors', async () => {
      vi.mocked(client.get).mockRejectedValue(new ApiError(500, 'Server error'))
      await expect(fetchGrocery()).rejects.toThrow('Server error')
    })
  })

  describe('toggleGroceryItem', () => {
    it('calls PATCH /grocery/items/:id with checked value', async () => {
      vi.mocked(client.patch).mockResolvedValue(undefined)
      await toggleGroceryItem('item-1', true)
      expect(client.patch).toHaveBeenCalledWith('/grocery/items/item-1', { checked: true })
    })
  })

  describe('removeGroceryItem', () => {
    it('calls DELETE /grocery/items/:id', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined)
      await removeGroceryItem('item-1')
      expect(client.delete).toHaveBeenCalledWith('/grocery/items/item-1')
    })
  })

  describe('addGroceryItem', () => {
    it('calls POST /grocery/items and returns mapped item', async () => {
      const apiItem: ApiGroceryItem = {
        id: 'new-1', name: 'Olive oil', amount: '', department: 'Pantry', checked: false, manual: true,
      }
      vi.mocked(client.post).mockResolvedValue(apiItem)
      const result = await addGroceryItem('Olive oil', '', 'Pantry')
      expect(client.post).toHaveBeenCalledWith('/grocery/items', { name: 'Olive oil', amount: '', department: 'Pantry' })
      expect(result.id).toBe('new-1')
      expect(result.name).toBe('Olive oil')
    })
  })
})
