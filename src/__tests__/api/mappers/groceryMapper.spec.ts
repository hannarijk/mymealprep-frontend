import { describe, it, expect } from 'vitest'
import { mapGroceryItem, mapGroceryListToGroup } from '@/api/mappers/groceryMapper'
import type { ApiGroceryItem, ApiGroceryList } from '@/api/types'

const makeApiItem = (overrides: Partial<ApiGroceryItem> = {}): ApiGroceryItem => ({
  id: 'item-1',
  name: 'Spinach',
  amount: '300g',
  department: 'Produce',
  checked: false,
  manual: false,
  ...overrides,
})

const makeApiList = (overrides: Partial<ApiGroceryList> = {}): ApiGroceryList => ({
  id: 'list-1',
  mealPlanId: 'plan-1',
  departments: {
    Produce: [makeApiItem({ id: 'p-1', name: 'Spinach', department: 'Produce' })],
    Dairy: [makeApiItem({ id: 'd-1', name: 'Eggs', department: 'Dairy', checked: true })],
  },
  generatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('groceryMapper', () => {
  describe('mapGroceryItem', () => {
    it('maps all fields', () => {
      const result = mapGroceryItem(makeApiItem({ checked: true, manual: true }))
      expect(result.id).toBe('item-1')
      expect(result.name).toBe('Spinach')
      expect(result.amount).toBe('300g')
      expect(result.checked).toBe(true)
      expect(result.manual).toBe(true)
    })

    it('preserves checked false', () => {
      const result = mapGroceryItem(makeApiItem({ checked: false }))
      expect(result.checked).toBe(false)
    })
  })

  describe('mapGroceryListToGroup', () => {
    it('groups items by department', () => {
      const result = mapGroceryListToGroup(makeApiList())
      expect(Object.keys(result)).toContain('Produce')
      expect(Object.keys(result)).toContain('Dairy')
    })

    it('maps items within each department', () => {
      const result = mapGroceryListToGroup(makeApiList())
      expect(result['Produce']).toHaveLength(1)
      expect(result['Produce']?.[0]?.name).toBe('Spinach')
      expect(result['Dairy']?.[0]?.checked).toBe(true)
    })

    it('handles empty departments', () => {
      const result = mapGroceryListToGroup(makeApiList({ departments: {} }))
      expect(Object.keys(result)).toHaveLength(0)
    })

    it('handles department with multiple items', () => {
      const result = mapGroceryListToGroup(makeApiList({
        departments: {
          Produce: [
            makeApiItem({ id: 'p-1', name: 'Spinach' }),
            makeApiItem({ id: 'p-2', name: 'Kale' }),
          ],
        },
      }))
      expect(result['Produce']).toHaveLength(2)
    })
  })
})
