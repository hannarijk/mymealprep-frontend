import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRecipeStore } from '@/stores/recipeStore'
import type { Recipe } from '@/types'

vi.mock('@/services/recipeService', () => ({
  fetchRecipes: vi.fn(),
}))

import { fetchRecipes } from '@/services/recipeService'

const makeRecipe = (id: number, name = `Recipe ${id}`): Recipe => ({
  id,
  name,
  tags: ['quick'],
  timeMinutes: 20,
  servings: 2,
  liked: false,
  usedWeeksAgo: null,
  imageUrl: '',
  section: 'Breakfast',
  why: 'Test',
  ingredients: [],
  steps: [],
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('recipeStore', () => {
  it('fetch populates recipes', async () => {
    vi.mocked(fetchRecipes).mockResolvedValue([makeRecipe(1), makeRecipe(2)])
    const store = useRecipeStore()
    await store.fetch()
    expect(store.recipes).toHaveLength(2)
  })

  it('fetch is a no-op when recipes already loaded', async () => {
    vi.mocked(fetchRecipes).mockResolvedValue([makeRecipe(1)])
    const store = useRecipeStore()
    await store.fetch()
    await store.fetch()
    expect(fetchRecipes).toHaveBeenCalledTimes(1)
  })

  it('sets error on service failure', async () => {
    vi.mocked(fetchRecipes).mockRejectedValue(new Error('Network error'))
    const store = useRecipeStore()
    await store.fetch()
    expect(store.error).toBe('Network error')
    expect(store.recipes).toHaveLength(0)
  })

  it('setSearch filters filteredRecipes', async () => {
    vi.mocked(fetchRecipes).mockResolvedValue([makeRecipe(1, 'Oatmeal'), makeRecipe(2, 'Lentil Soup')])
    const store = useRecipeStore()
    await store.fetch()
    store.setSearch('oat')
    expect(store.filteredRecipes).toHaveLength(1)
    expect(store.filteredRecipes[0]?.id).toBe(1)
  })

  it('setSearch resets recipePage to 1', async () => {
    vi.mocked(fetchRecipes).mockResolvedValue(Array.from({ length: 20 }, (_, i) => makeRecipe(i + 1)))
    const store = useRecipeStore()
    await store.fetch()
    store.nextPage()
    expect(store.recipePage).toBe(2)
    store.setSearch('x')
    expect(store.recipePage).toBe(1)
  })

  it('totalRecipePages is at least 1 when recipes is empty', () => {
    const store = useRecipeStore()
    expect(store.totalRecipePages).toBe(1)
  })

  it('nextPage does not exceed totalRecipePages', async () => {
    vi.mocked(fetchRecipes).mockResolvedValue(Array.from({ length: 9 }, (_, i) => makeRecipe(i + 1)))
    const store = useRecipeStore()
    await store.fetch()
    store.nextPage()
    store.nextPage()
    store.nextPage()
    expect(store.recipePage).toBe(2)
  })

  it('prevPage does not go below 1', () => {
    const store = useRecipeStore()
    store.prevPage()
    expect(store.recipePage).toBe(1)
  })
})
