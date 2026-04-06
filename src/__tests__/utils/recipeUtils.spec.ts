import { describe, it, expect } from 'vitest'
import { filterRecipes, paginateItems } from '@/utils/recipeUtils'
import type { Recipe } from '@/types'

const makeRecipe = (overrides: Partial<Recipe>): Recipe => ({
  id: 1,
  name: 'Test Recipe',
  tags: ['quick'],
  timeMinutes: 20,
  servings: 2,
  liked: false,
  usedWeeksAgo: null,
  imageUrl: '',
  section: 'Breakfast',
  why: 'Great for mornings',
  ingredients: [],
  steps: [],
  ...overrides,
})

describe('filterRecipes', () => {
  const recipes = [
    makeRecipe({ id: 1, name: 'Baked Oatmeal', tags: ['breakfast', 'meal-prep'], why: 'Batch cook easily' }),
    makeRecipe({ id: 2, name: 'Lentil Soup', tags: ['vegan', 'freezer'], why: 'Hearty and filling' }),
    makeRecipe({ id: 3, name: 'Egg Muffins', tags: ['protein', 'quick'], section: 'Breakfast' }),
  ]

  it('returns all recipes when search is empty', () => {
    expect(filterRecipes(recipes, '')).toHaveLength(3)
  })

  it('returns all recipes when search is whitespace', () => {
    expect(filterRecipes(recipes, '   ')).toHaveLength(3)
  })

  it('filters by name (case-insensitive)', () => {
    const result = filterRecipes(recipes, 'oat')
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(1)
  })

  it('filters by tag', () => {
    const result = filterRecipes(recipes, 'vegan')
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(2)
  })

  it('filters by why field', () => {
    const result = filterRecipes(recipes, 'batch')
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe(1)
  })

  it('filters by section', () => {
    const result = filterRecipes(recipes, 'breakfast')
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty array when no matches', () => {
    expect(filterRecipes(recipes, 'xyzzy')).toHaveLength(0)
  })
})

describe('paginateItems', () => {
  const items = Array.from({ length: 10 }, (_, i) => i + 1)

  it('returns first page slice', () => {
    expect(paginateItems(items, 1, 4)).toEqual([1, 2, 3, 4])
  })

  it('returns second page slice', () => {
    expect(paginateItems(items, 2, 4)).toEqual([5, 6, 7, 8])
  })

  it('returns partial last page', () => {
    expect(paginateItems(items, 3, 4)).toEqual([9, 10])
  })

  it('clamps page above total pages to last page', () => {
    expect(paginateItems(items, 99, 4)).toEqual([9, 10])
  })

  it('clamps page below 1 to first page', () => {
    expect(paginateItems(items, 0, 4)).toEqual([1, 2, 3, 4])
  })

  it('returns empty array when items is empty', () => {
    expect(paginateItems([], 1, 4)).toEqual([])
  })
})
