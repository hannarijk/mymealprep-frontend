import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe } from '@/types'

vi.mock('@/services/mealPlanService', () => ({
  fetchCurrentPlan: vi.fn(),
  updatePlan: vi.fn().mockResolvedValue(undefined),
  clonePlan: vi.fn(),
  createPlan: vi.fn(),
  fetchPlanHistory: vi.fn(),
}))

const makeFetchResult = (
  overrides: Partial<{ title: string; type: 'Weekly' | 'Biweekly'; recipes: { Breakfast: string[]; 'Lunch/Dinner': string[] } }> = {},
) => ({
  recipes: { Breakfast: [], 'Lunch/Dinner': [], ...overrides.recipes },
  title: overrides.title ?? 'My Meal Plan',
  type: overrides.type ?? ('Weekly' as const),
})

vi.mock('@/services/recipeService', () => ({
  fetchRecipes: vi.fn(),
}))

import { fetchCurrentPlan, updatePlan, clonePlan, createPlan as createPlanService } from '@/services/mealPlanService'

const makeRecipe = (id: string): Recipe => ({
  id,
  name: `Recipe ${id}`,
  tags: [],
  timeMinutes: 20,
  servings: 2,
  liked: false,
  usedWeeksAgo: null,
  imageUrl: '',
  section: 'Breakfast',
  why: '',
  ingredients: [],
  steps: [],
})

function seedRecipes(ids: string[]) {
  const recipeStore = useRecipeStore()
  recipeStore.recipes = ids.map(makeRecipe)
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('mealPlanStore', () => {
  it('fetch sets currentPlan, planTitle, and planType from service', async () => {
    vi.mocked(fetchCurrentPlan).mockResolvedValue(
      makeFetchResult({ recipes: { Breakfast: ['1'], 'Lunch/Dinner': ['4'] }, title: 'Week 1', type: 'Biweekly' }),
    )
    const store = useMealPlanStore()
    await store.fetch()
    expect(store.currentPlan.Breakfast).toEqual(['1'])
    expect(store.currentPlan['Lunch/Dinner']).toEqual(['4'])
    expect(store.planTitle).toBe('Week 1')
    expect(store.planType).toBe('Biweekly')
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(fetchCurrentPlan).mockRejectedValue(new Error('API error'))
    const store = useMealPlanStore()
    await store.fetch()
    expect(store.error).toBe('API error')
  })

  it('addRecipe adds id to correct section', () => {
    const store = useMealPlanStore()
    store.addRecipe('1', 'Breakfast')
    expect(store.currentPlan.Breakfast).toContain('1')
  })

  it('addRecipe is idempotent', () => {
    const store = useMealPlanStore()
    store.addRecipe('1', 'Breakfast')
    store.addRecipe('1', 'Breakfast')
    expect(store.currentPlan.Breakfast.filter((id) => id === '1')).toHaveLength(1)
  })

  it('removeRecipe removes the correct id', () => {
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = ['1', '2']
    store.removeRecipe('1', 'Breakfast')
    expect(store.currentPlan.Breakfast).toEqual(['2'])
  })

  it('clearPlan empties both sections', () => {
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = ['1', '2']
    store.currentPlan['Lunch/Dinner'] = ['3', '4']
    store.clearPlan()
    expect(store.currentPlan.Breakfast).toHaveLength(0)
    expect(store.currentPlan['Lunch/Dinner']).toHaveLength(0)
  })

  it('togglePlanType switches Weekly ↔ Biweekly', () => {
    const store = useMealPlanStore()
    expect(store.planType).toBe('Weekly')
    store.togglePlanType()
    expect(store.planType).toBe('Biweekly')
    store.togglePlanType()
    expect(store.planType).toBe('Weekly')
  })

  it('togglePlanType calls updatePlan with new type', () => {
    const store = useMealPlanStore()
    store.togglePlanType()
    expect(updatePlan).toHaveBeenCalledWith(store.currentPlan, { type: 'Biweekly' })
  })

  it('suggestions excludes already-selected recipe ids', () => {
    seedRecipes(['1', '2', '3', '4'])
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = ['1']
    store.currentPlan['Lunch/Dinner'] = ['2']
    const ids = store.suggestions.map((r) => r.id)
    expect(ids).not.toContain('1')
    expect(ids).not.toContain('2')
    expect(ids).toContain('3')
    expect(ids).toContain('4')
  })

  it('reusePlan calls clonePlan with plan id + copy title, sets currentPlan and planTitle', async () => {
    vi.mocked(clonePlan).mockResolvedValue({
      recipes: { Breakfast: ['9', '1'], 'Lunch/Dinner': ['14', '5'] },
      title: 'Old Plan (copy)',
    })
    const store = useMealPlanStore()
    const plan = {
      id: 'plan-5', title: 'Old Plan', type: 'Weekly' as const,
      breakfasts: 2, mains: 2, notes: '', sourcePlanId: null,
      recipes: { Breakfast: ['9', '1'], 'Lunch/Dinner': ['14', '5'] },
    }
    await store.reusePlan(plan)
    expect(clonePlan).toHaveBeenCalledWith('plan-5', 'Old Plan (copy)')
    expect(store.currentPlan.Breakfast).toEqual(['9', '1'])
    expect(store.currentPlan['Lunch/Dinner']).toEqual(['14', '5'])
    expect(store.planTitle).toBe('Old Plan (copy)')
  })

  describe('createPlan', () => {
    it('sets currentPlan, planTitle, planType from service result', async () => {
      vi.mocked(createPlanService).mockResolvedValue({
        recipes: { Breakfast: [], 'Lunch/Dinner': [] },
        title: 'Week of Apr 14',
        type: 'Weekly',
      })
      const store = useMealPlanStore()
      await store.createPlan('Week of Apr 14')
      expect(createPlanService).toHaveBeenCalledWith('Week of Apr 14')
      expect(store.currentPlan).toEqual({ Breakfast: [], 'Lunch/Dinner': [] })
      expect(store.planTitle).toBe('Week of Apr 14')
      expect(store.planType).toBe('Weekly')
    })
  })

  describe('restorePlan', () => {
    it('sets currentPlan from snapshot and calls updatePlan', () => {
      const store = useMealPlanStore()
      const snapshot = { Breakfast: ['r1'], 'Lunch/Dinner': ['r2'] }
      store.restorePlan(snapshot)
      expect(store.currentPlan).toEqual(snapshot)
      expect(updatePlan).toHaveBeenCalledWith(snapshot)
    })
  })

  describe('renameActivePlan', () => {
    it('updates planTitle and calls updatePlan with new title', async () => {
      vi.mocked(fetchCurrentPlan).mockResolvedValue(makeFetchResult({ title: 'Original' }))
      const store = useMealPlanStore()
      await store.fetch()
      await store.renameActivePlan('New Name')
      expect(store.planTitle).toBe('New Name')
      expect(updatePlan).toHaveBeenCalledWith(store.currentPlan, { title: 'New Name' })
    })

    it('reverts planTitle and sets renameError on API failure', async () => {
      vi.mocked(fetchCurrentPlan).mockResolvedValue(makeFetchResult({ title: 'Original' }))
      vi.mocked(updatePlan).mockRejectedValueOnce(new Error('Network error'))
      const store = useMealPlanStore()
      await store.fetch()
      await store.renameActivePlan('New Name')
      expect(store.planTitle).toBe('Original')
      expect(store.renameError).toBe('Failed to save name. Please try again.')
    })
  })
})
