import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '@/api/client'

vi.mock('@/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/client')>()
  return {
    ...actual,
    client: {
      get: vi.fn(),
      getAll: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { client } from '@/api/client'
import { fetchCurrentPlan, updatePlan, clonePlan, createPlan, deletePlan, fetchPlanHistory } from '@/services/mealPlanService'
import type { ApiMealPlan } from '@/api/types'

const makeApiPlan = (overrides: Partial<ApiMealPlan> = {}): ApiMealPlan => ({
  id: 'plan-1',
  title: 'My Meal Plan',
  type: 'Weekly',
  notes: '',
  active: true,
  sourcePlanId: null,
  breakfasts: 2,
  mains: 3,
  recipes: [
    { recipeId: 'r1', section: 'Breakfast' },
    { recipeId: 'r2', section: 'Lunch/Dinner' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mealPlanService', () => {
  describe('fetchCurrentPlan', () => {
    it('returns mapped recipes, title, and type from active plan', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ title: 'Week 1', type: 'Biweekly' }))
      const result = await fetchCurrentPlan()
      expect(result.recipes.Breakfast).toEqual(['r1'])
      expect(result.recipes['Lunch/Dinner']).toEqual(['r2'])
      expect(result.title).toBe('Week 1')
      expect(result.type).toBe('Biweekly')
    })

    it('calls GET /meal-plans/active', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan())
      await fetchCurrentPlan()
      expect(client.get).toHaveBeenCalledWith('/meal-plans/active')
    })

    it('auto-creates plan on 404 (create now activates immediately)', async () => {
      const created = makeApiPlan({ id: 'new-plan', active: true })
      vi.mocked(client.get).mockRejectedValue(new ApiError(404, 'Not found'))
      vi.mocked(client.post).mockResolvedValueOnce(created)

      const result = await fetchCurrentPlan()
      expect(client.post).toHaveBeenCalledTimes(1)
      expect(client.post).toHaveBeenCalledWith('/meal-plans', expect.objectContaining({ recipes: [] }))
      expect(result.recipes.Breakfast).toEqual(['r1'])
    })

    it('re-throws non-404 errors', async () => {
      vi.mocked(client.get).mockRejectedValue(new ApiError(500, 'Server error'))
      await expect(fetchCurrentPlan()).rejects.toThrow('Server error')
    })
  })

  describe('updatePlan', () => {
    it('calls PUT with mapped recipes after fetchCurrentPlan sets activePlanId', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      vi.mocked(client.post).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: ['r1'], 'Lunch/Dinner': [] })

      expect(client.put).toHaveBeenCalledWith(
        '/meal-plans/plan-99',
        expect.objectContaining({
          recipes: [{ recipeId: 'r1', section: 'Breakfast' }],
        }),
      )
    })

    it('persists type change via meta param', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99', type: 'Weekly' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      vi.mocked(client.post).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] }, { type: 'Biweekly' })

      expect(client.put).toHaveBeenCalledWith(
        '/meal-plans/plan-99',
        expect.objectContaining({ type: 'Biweekly' }),
      )
    })

    it('persists title change via meta param', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99', title: 'Old Title' }))
      vi.mocked(client.put).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] }, { title: 'New Title' })

      expect(client.put).toHaveBeenCalledWith(
        '/meal-plans/plan-99',
        expect.objectContaining({ title: 'New Title' }),
      )
    })

    it('does not call /grocery/regenerate', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99' }))
      vi.mocked(client.put).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })

      expect(client.post).not.toHaveBeenCalledWith('/grocery/regenerate', {})
    })
  })

  describe('clonePlan', () => {
    it('calls POST /meal-plans/:id/clone with empty body when no title given', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42' }))
      await clonePlan('plan-42')
      expect(client.post).toHaveBeenCalledWith('/meal-plans/plan-42/clone', {})
    })

    it('passes title in body when provided', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42', title: 'Week 1 (copy)' }))
      await clonePlan('plan-42', 'Week 1 (copy)')
      expect(client.post).toHaveBeenCalledWith('/meal-plans/plan-42/clone', { title: 'Week 1 (copy)' })
    })

    it('returns mapped recipes and title from cloned plan', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42', title: 'Week 1 (copy)' }))
      const result = await clonePlan('plan-42', 'Week 1 (copy)')
      expect(result.recipes.Breakfast).toEqual(['r1'])
      expect(result.recipes['Lunch/Dinner']).toEqual(['r2'])
      expect(result.title).toBe('Week 1 (copy)')
    })

    it('updates activePlanId so subsequent updatePlan uses the cloned plan', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      await clonePlan('plan-42')
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })
      expect(client.put).toHaveBeenCalledWith('/meal-plans/plan-42', expect.anything())
    })
  })

  describe('createPlan', () => {
    it('calls POST /meal-plans with title and returns empty recipes, title, type', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'new-1', title: 'Week of Apr 14', type: 'Weekly' }))
      const result = await createPlan('Week of Apr 14')
      expect(client.post).toHaveBeenCalledWith('/meal-plans', expect.objectContaining({ title: 'Week of Apr 14', recipes: [] }))
      expect(result.recipes).toEqual({ Breakfast: [], 'Lunch/Dinner': [] })
      expect(result.title).toBe('Week of Apr 14')
      expect(result.type).toBe('Weekly')
    })

    it('updates activePlanId so subsequent updatePlan targets the new plan', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'new-99', title: 'Week of Apr 14' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      await createPlan('Week of Apr 14')
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })
      expect(client.put).toHaveBeenCalledWith('/meal-plans/new-99', expect.anything())
    })
  })

  describe('deletePlan', () => {
    it('calls DELETE /meal-plans/:id', async () => {
      vi.mocked(client.delete).mockResolvedValue(undefined)
      await deletePlan('plan-99')
      expect(client.delete).toHaveBeenCalledWith('/meal-plans/plan-99')
    })
  })

  describe('fetchPlanHistory', () => {
    it('calls client.getAll with /meal-plans and limit=100', async () => {
      vi.mocked(client.getAll).mockResolvedValue([])
      await fetchPlanHistory()
      expect(client.getAll).toHaveBeenCalledWith('/meal-plans', { limit: 100 })
    })

    it('maps returned items to MealPlan[]', async () => {
      vi.mocked(client.getAll).mockResolvedValue([makeApiPlan({ id: '1' }), makeApiPlan({ id: '2' })])
      const result = await fetchPlanHistory()
      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('1')
    })
  })
})
