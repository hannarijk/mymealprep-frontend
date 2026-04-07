import { describe, it, expect } from 'vitest'
import { mapRecipe, mapRecipes } from '@/api/mappers/recipeMapper'
import type { ApiRecipe } from '@/api/types'

const makeApiRecipe = (overrides: Partial<ApiRecipe> = {}): ApiRecipe => ({
  id: 'abc-123',
  name: 'Test Recipe',
  section: 'Breakfast',
  tags: ['quick', 'healthy'],
  timeMinutes: 30,
  servings: 2,
  why: 'Great for meal prep',
  imageUrl: 'https://example.com/img.jpg',
  steps: ['Step 1', 'Step 2'],
  liked: true,
  ingredients: [
    { id: 'ing-1', name: 'Oats', amount: '100g', department: 'Grains' },
    { id: 'ing-2', name: 'Milk', amount: '200ml', department: 'Dairy' },
  ],
  ...overrides,
})

describe('recipeMapper', () => {
  it('maps all scalar fields correctly', () => {
    const result = mapRecipe(makeApiRecipe())
    expect(result.id).toBe('abc-123')
    expect(result.name).toBe('Test Recipe')
    expect(result.section).toBe('Breakfast')
    expect(result.tags).toEqual(['quick', 'healthy'])
    expect(result.timeMinutes).toBe(30)
    expect(result.servings).toBe(2)
    expect(result.why).toBe('Great for meal prep')
    expect(result.imageUrl).toBe('https://example.com/img.jpg')
    expect(result.steps).toEqual(['Step 1', 'Step 2'])
    expect(result.liked).toBe(true)
  })

  it('maps ingredients to Ingredient[]', () => {
    const result = mapRecipe(makeApiRecipe())
    expect(result.ingredients).toHaveLength(2)
    expect(result.ingredients[0]).toEqual({ id: 'ing-1', name: 'Oats', amount: '100g', department: 'Grains' })
    expect(result.ingredients[1]).toEqual({ id: 'ing-2', name: 'Milk', amount: '200ml', department: 'Dairy' })
  })

  it('sets usedWeeksAgo to null', () => {
    const result = mapRecipe(makeApiRecipe())
    expect(result.usedWeeksAgo).toBeNull()
  })

  it('handles empty ingredients array', () => {
    const result = mapRecipe(makeApiRecipe({ ingredients: [] }))
    expect(result.ingredients).toEqual([])
  })

  it('handles missing ingredients field (omitempty from list endpoint)', () => {
    const api = makeApiRecipe() as Omit<ApiRecipe, 'ingredients'> & { ingredients?: ApiRecipe['ingredients'] }
    delete api.ingredients
    const result = mapRecipe(api as ApiRecipe)
    expect(result.ingredients).toEqual([])
  })

  it('mapRecipes maps an array', () => {
    const result = mapRecipes([makeApiRecipe({ id: '1' }), makeApiRecipe({ id: '2' })])
    expect(result).toHaveLength(2)
    expect(result[0]?.id).toBe('1')
    expect(result[1]?.id).toBe('2')
  })
})
