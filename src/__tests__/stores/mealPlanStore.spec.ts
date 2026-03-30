import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe, CurrentPlan } from '@/types'

vi.mock('@/services/mealPlanService', () => ({
  fetchCurrentPlan: vi.fn(),
  updatePlan: vi.fn().mockResolvedValue(undefined),
  fetchPlanHistory: vi.fn(),
}))

vi.mock('@/services/recipeService', () => ({
  fetchRecipes: vi.fn(),
}))

import { fetchCurrentPlan } from '@/services/mealPlanService'

const makeRecipe = (id: number): Recipe => ({
  id,
  name: `Recipe ${id}`,
  tags: [],
  time: 20,
  servings: 2,
  liked: false,
  usedWeeksAgo: null,
  image: '',
  section: 'Breakfast',
  why: '',
  ingredients: [],
  steps: [],
})

function seedRecipes(ids: number[]) {
  const recipeStore = useRecipeStore()
  recipeStore.recipes = ids.map(makeRecipe)
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('mealPlanStore', () => {
  it('fetch sets currentPlan from service', async () => {
    vi.mocked(fetchCurrentPlan).mockResolvedValue({ Breakfast: [1], 'Lunch/Dinner': [4] })
    const store = useMealPlanStore()
    await store.fetch()
    expect(store.currentPlan.Breakfast).toEqual([1])
    expect(store.currentPlan['Lunch/Dinner']).toEqual([4])
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(fetchCurrentPlan).mockRejectedValue(new Error('API error'))
    const store = useMealPlanStore()
    await store.fetch()
    expect(store.error).toBe('API error')
  })

  it('addRecipe adds id to correct section', () => {
    const store = useMealPlanStore()
    store.addRecipe(1, 'Breakfast')
    expect(store.currentPlan.Breakfast).toContain(1)
  })

  it('addRecipe is idempotent', () => {
    const store = useMealPlanStore()
    store.addRecipe(1, 'Breakfast')
    store.addRecipe(1, 'Breakfast')
    expect(store.currentPlan.Breakfast.filter((id) => id === 1)).toHaveLength(1)
  })

  it('removeRecipe removes the correct id', () => {
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = [1, 2]
    store.removeRecipe(1, 'Breakfast')
    expect(store.currentPlan.Breakfast).toEqual([2])
  })

  it('clearPlan empties both sections', () => {
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = [1, 2]
    store.currentPlan['Lunch/Dinner'] = [3, 4]
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

  it('suggestions excludes already-selected recipe ids', () => {
    seedRecipes([1, 2, 3, 4])
    const store = useMealPlanStore()
    store.currentPlan.Breakfast = [1]
    store.currentPlan['Lunch/Dinner'] = [2]
    const ids = store.suggestions.map((r) => r.id)
    expect(ids).not.toContain(1)
    expect(ids).not.toContain(2)
    expect(ids).toContain(3)
    expect(ids).toContain(4)
  })

  it('reusePlan sets currentPlan from recipeIds', () => {
    const store = useMealPlanStore()
    const plan = {
      id: 1, title: 'Old Plan', type: 'Weekly' as const,
      breakfasts: 2, mains: 2, notes: '', reused: false,
      recipeIds: { Breakfast: [9, 1], 'Lunch/Dinner': [14, 5] },
    }
    store.reusePlan(plan)
    expect(store.currentPlan.Breakfast).toEqual([9, 1])
    expect(store.currentPlan['Lunch/Dinner']).toEqual([14, 5])
  })
})
