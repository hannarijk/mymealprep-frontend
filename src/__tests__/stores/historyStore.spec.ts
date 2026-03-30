import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore'
import { useMealPlanStore } from '@/stores/mealPlanStore'
import type { MealPlan } from '@/types'

vi.mock('@/services/mealPlanService', () => ({
  fetchCurrentPlan: vi.fn().mockResolvedValue({ Breakfast: [], 'Lunch/Dinner': [] }),
  updatePlan: vi.fn().mockResolvedValue(undefined),
  fetchPlanHistory: vi.fn(),
}))

vi.mock('@/services/recipeService', () => ({
  fetchRecipes: vi.fn(),
}))

import { fetchPlanHistory } from '@/services/mealPlanService'

const makePlan = (id: number): MealPlan => ({
  id,
  title: `Week ${id}`,
  type: 'Weekly',
  breakfasts: 3,
  mains: 3,
  notes: '',
  reused: false,
  recipeIds: { Breakfast: [id], 'Lunch/Dinner': [id + 10] },
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('historyStore', () => {
  it('fetch populates history', async () => {
    vi.mocked(fetchPlanHistory).mockResolvedValue([makePlan(1), makePlan(2), makePlan(3)])
    const store = useHistoryStore()
    await store.fetch()
    expect(store.history).toHaveLength(3)
  })

  it('fetch is a no-op when history already loaded', async () => {
    vi.mocked(fetchPlanHistory).mockResolvedValue([makePlan(1)])
    const store = useHistoryStore()
    await store.fetch()
    await store.fetch()
    expect(fetchPlanHistory).toHaveBeenCalledTimes(1)
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(fetchPlanHistory).mockRejectedValue(new Error('API error'))
    const store = useHistoryStore()
    await store.fetch()
    expect(store.error).toBe('API error')
  })

  it('totalHistoryPages calculates correctly with 11 entries (pageSize=4)', () => {
    const store = useHistoryStore()
    store.history = Array.from({ length: 11 }, (_, i) => makePlan(i + 1))
    expect(store.totalHistoryPages).toBe(3)
  })

  it('totalHistoryPages is at least 1 when empty', () => {
    const store = useHistoryStore()
    expect(store.totalHistoryPages).toBe(1)
  })

  it('pagedHistory returns correct slice for page 1', () => {
    const store = useHistoryStore()
    store.history = Array.from({ length: 5 }, (_, i) => makePlan(i + 1))
    store.historyPage = 1
    expect(store.pagedHistory).toHaveLength(4)
  })

  it('pagedHistory returns correct slice for last page', () => {
    const store = useHistoryStore()
    store.history = Array.from({ length: 5 }, (_, i) => makePlan(i + 1))
    store.historyPage = 2
    expect(store.pagedHistory).toHaveLength(1)
  })

  it('nextPage and prevPage are bounded', () => {
    const store = useHistoryStore()
    store.history = Array.from({ length: 5 }, (_, i) => makePlan(i + 1))
    store.nextPage()
    store.nextPage()
    store.nextPage()
    expect(store.historyPage).toBe(2)
    store.prevPage()
    store.prevPage()
    store.prevPage()
    expect(store.historyPage).toBe(1)
  })

  it('reusePlan sets mealPlanStore.currentPlan to plan.recipeIds', () => {
    const store = useHistoryStore()
    const mealPlanStore = useMealPlanStore()
    const plan = makePlan(5)
    store.reusePlan(plan)
    expect(mealPlanStore.currentPlan.Breakfast).toEqual([5])
    expect(mealPlanStore.currentPlan['Lunch/Dinner']).toEqual([15])
  })
})
