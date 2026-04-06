import { describe, it, expect } from 'vitest'
import { getSuggestions } from '@/utils/mealPlanUtils'
import type { Recipe } from '@/types'

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

describe('getSuggestions', () => {
  const recipes = ['1', '2', '3', '4', '5'].map(makeRecipe)

  it('excludes recipes in selectedIds', () => {
    const result = getSuggestions(recipes, new Set(['1', '2']))
    expect(result.map((r) => r.id)).toEqual(['3', '4', '5'])
  })

  it('returns all when selectedIds is empty', () => {
    expect(getSuggestions(recipes, new Set())).toHaveLength(5)
  })

  it('returns empty array when all recipes are selected', () => {
    expect(getSuggestions(recipes, new Set(['1', '2', '3', '4', '5']))).toHaveLength(0)
  })

  it('respects the limit', () => {
    expect(getSuggestions(recipes, new Set(), 3)).toHaveLength(3)
  })

  it('does not exceed available recipes when limit is larger', () => {
    expect(getSuggestions(recipes, new Set(), 99)).toHaveLength(5)
  })
})
