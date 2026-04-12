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
import { fetchRecipes } from '@/services/recipeService'
import type { ApiRecipe } from '@/api/types'

const makeApiRecipe = (id: string): ApiRecipe => ({
  id,
  name: `Recipe ${id}`,
  section: 'Breakfast',
  tags: ['quick'],
  timeMinutes: 20,
  servings: 2,
  why: 'Good for prep',
  imageUrl: 'https://example.com/img.jpg',
  steps: ['Step 1'],
  liked: false,
  ingredients: [{ id: 'i-1', name: 'Oats', amount: '100g', department: 'Grains' }],
})

describe('recipeService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls client.getAll with /recipes and limit=100', async () => {
    vi.mocked(client.getAll).mockResolvedValue([])
    await fetchRecipes()
    expect(client.getAll).toHaveBeenCalledWith('/recipes', { limit: 100 })
  })

  it('maps returned items to Recipe[]', async () => {
    vi.mocked(client.getAll).mockResolvedValue([makeApiRecipe('r-1'), makeApiRecipe('r-2')])
    const result = await fetchRecipes()
    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe('r-1')
    expect(result[0]?.timeMinutes).toBe(20)
    expect(result[0]?.imageUrl).toBe('https://example.com/img.jpg')
    expect(result[0]?.ingredients[0]?.name).toBe('Oats')
    expect(result[0]?.usedWeeksAgo).toBeNull()
  })

  it('propagates ApiError from client', async () => {
    vi.mocked(client.getAll).mockRejectedValue(new ApiError(401, 'Unauthorized'))
    await expect(fetchRecipes()).rejects.toThrow('Unauthorized')
  })
})
