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
import { fetchRecipes } from '@/services/recipeService'
import type { ApiRecipeListResponse } from '@/api/types'

const makeApiRecipe = (id: string) => ({
  id,
  name: `Recipe ${id}`,
  section: 'Breakfast' as const,
  tags: ['quick'],
  timeMinutes: 20,
  servings: 2,
  why: 'Good for prep',
  imageUrl: 'https://example.com/img.jpg',
  steps: ['Step 1'],
  liked: false,
  ingredients: [{ id: 'i-1', name: 'Oats', amount: '100g', department: 'Grains' }],
})

const mockResponse: ApiRecipeListResponse = {
  data: [makeApiRecipe('r-1'), makeApiRecipe('r-2')],
  totalCount: 2,
  page: 1,
  limit: 100,
}

describe('recipeService', () => {
  it('calls GET /recipes with limit=100', async () => {
    vi.mocked(client.get).mockResolvedValue(mockResponse)
    await fetchRecipes()
    expect(client.get).toHaveBeenCalledWith('/recipes', { limit: 100 })
  })

  it('maps API response to Recipe[]', async () => {
    vi.mocked(client.get).mockResolvedValue(mockResponse)
    const result = await fetchRecipes()
    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe('r-1')
    expect(result[0]?.timeMinutes).toBe(20)
    expect(result[0]?.imageUrl).toBe('https://example.com/img.jpg')
    expect(result[0]?.ingredients[0]?.name).toBe('Oats')
    expect(result[0]?.usedWeeksAgo).toBeNull()
  })

  it('propagates ApiError from client', async () => {
    vi.mocked(client.get).mockRejectedValue(new ApiError(401, 'Unauthorized'))
    await expect(fetchRecipes()).rejects.toThrow('Unauthorized')
  })
})
