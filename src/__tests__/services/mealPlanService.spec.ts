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
import { fetchCurrentPlan, updatePlan, activatePlan, fetchPlanHistory } from '@/services/mealPlanService'
import type { ApiMealPlan } from '@/api/types'

const makeApiPlan = (overrides: Partial<ApiMealPlan> = {}): ApiMealPlan => ({
  id: 'plan-1',
  title: 'My Meal Plan',
  type: 'Weekly',
  notes: '',
  active: true,
  reused: false,
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
    it('returns mapped CurrentPlan from active plan', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan())
      const result = await fetchCurrentPlan()
      expect(result.Breakfast).toEqual(['r1'])
      expect(result['Lunch/Dinner']).toEqual(['r2'])
    })

    it('calls GET /meal-plans/active', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan())
      await fetchCurrentPlan()
      expect(client.get).toHaveBeenCalledWith('/meal-plans/active')
    })

    it('auto-creates and activates plan on 404', async () => {
      const created = makeApiPlan({ id: 'new-plan' })
      const activated = makeApiPlan({ id: 'new-plan', active: true })
      vi.mocked(client.get).mockRejectedValue(new ApiError(404, 'Not found'))
      vi.mocked(client.post)
        .mockResolvedValueOnce(created)
        .mockResolvedValueOnce(activated)

      const result = await fetchCurrentPlan()
      expect(client.post).toHaveBeenCalledWith('/meal-plans', expect.objectContaining({ recipes: [] }))
      expect(client.post).toHaveBeenCalledWith('/meal-plans/new-plan/activate', {})
      expect(result.Breakfast).toEqual(['r1'])
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

    it('does not call /grocery/regenerate', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99' }))
      vi.mocked(client.put).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })

      expect(client.post).not.toHaveBeenCalledWith('/grocery/regenerate', {})
    })
  })

  describe('activatePlan', () => {
    it('calls POST /meal-plans/:id/activate and returns mapped CurrentPlan', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42' }))
      const result = await activatePlan('plan-42')
      expect(client.post).toHaveBeenCalledWith('/meal-plans/plan-42/activate', {})
      expect(result.Breakfast).toEqual(['r1'])
      expect(result['Lunch/Dinner']).toEqual(['r2'])
    })

    it('updates activePlanId so subsequent updatePlan uses the activated plan', async () => {
      vi.mocked(client.post).mockResolvedValue(makeApiPlan({ id: 'plan-42' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      await activatePlan('plan-42')
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })
      expect(client.put).toHaveBeenCalledWith('/meal-plans/plan-42', expect.anything())
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
