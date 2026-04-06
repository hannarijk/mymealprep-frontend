import { describe, it, expect, vi, beforeEach } from 'vitest'
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
import { fetchCurrentPlan, updatePlan, fetchPlanHistory } from '@/services/mealPlanService'
import type { ApiMealPlan, ApiMealPlanListResponse } from '@/api/types'

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

    it('fires POST /grocery/regenerate after PUT', async () => {
      vi.mocked(client.get).mockResolvedValue(makeApiPlan({ id: 'plan-99' }))
      vi.mocked(client.put).mockResolvedValue(undefined)
      vi.mocked(client.post).mockResolvedValue(undefined)

      await fetchCurrentPlan()
      await updatePlan({ Breakfast: [], 'Lunch/Dinner': [] })

      expect(client.post).toHaveBeenCalledWith('/grocery/regenerate', {})
    })
  })

  describe('fetchPlanHistory', () => {
    it('calls GET /meal-plans with limit=50', async () => {
      const mockResponse: ApiMealPlanListResponse = {
        data: [makeApiPlan({ id: '1' }), makeApiPlan({ id: '2' })],
        totalCount: 2,
        page: 1,
        limit: 50,
      }
      vi.mocked(client.get).mockResolvedValue(mockResponse)
      const result = await fetchPlanHistory()
      expect(client.get).toHaveBeenCalledWith('/meal-plans', { limit: 50 })
      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('1')
    })
  })
})
