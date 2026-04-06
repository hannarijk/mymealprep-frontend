import { describe, it, expect } from 'vitest'
import { mapRecipesToCurrentPlan, mapCurrentPlanToRecipes, mapMealPlan, mapMealPlans } from '@/api/mappers/mealPlanMapper'
import type { ApiMealPlan, ApiPlanRecipe } from '@/api/types'

const makeApiPlan = (overrides: Partial<ApiMealPlan> = {}): ApiMealPlan => ({
  id: 'plan-1',
  title: 'My Meal Plan',
  type: 'Weekly',
  notes: '',
  active: true,
  reused: false,
  breakfasts: 3,
  mains: 4,
  recipes: [
    { recipeId: 'r1', section: 'Breakfast' },
    { recipeId: 'r2', section: 'Lunch/Dinner' },
    { recipeId: 'r3', section: 'Breakfast' },
  ],
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

describe('mealPlanMapper', () => {
  describe('mapRecipesToCurrentPlan', () => {
    it('groups recipes by section', () => {
      const recipes: ApiPlanRecipe[] = [
        { recipeId: 'r1', section: 'Breakfast' },
        { recipeId: 'r2', section: 'Lunch/Dinner' },
        { recipeId: 'r3', section: 'Breakfast' },
      ]
      const result = mapRecipesToCurrentPlan(recipes)
      expect(result.Breakfast).toEqual(['r1', 'r3'])
      expect(result['Lunch/Dinner']).toEqual(['r2'])
    })

    it('returns empty arrays when recipes is empty', () => {
      const result = mapRecipesToCurrentPlan([])
      expect(result.Breakfast).toEqual([])
      expect(result['Lunch/Dinner']).toEqual([])
    })
  })

  describe('mapCurrentPlanToRecipes', () => {
    it('flattens grouped plan to ApiPlanRecipe[]', () => {
      const plan = { Breakfast: ['r1', 'r3'], 'Lunch/Dinner': ['r2'] }
      const result = mapCurrentPlanToRecipes(plan)
      expect(result).toContainEqual({ recipeId: 'r1', section: 'Breakfast' })
      expect(result).toContainEqual({ recipeId: 'r3', section: 'Breakfast' })
      expect(result).toContainEqual({ recipeId: 'r2', section: 'Lunch/Dinner' })
      expect(result).toHaveLength(3)
    })

    it('round-trips with mapRecipesToCurrentPlan', () => {
      const original = { Breakfast: ['a', 'b'], 'Lunch/Dinner': ['c'] }
      const flat = mapCurrentPlanToRecipes(original)
      const back = mapRecipesToCurrentPlan(flat)
      expect(back.Breakfast).toEqual(['a', 'b'])
      expect(back['Lunch/Dinner']).toEqual(['c'])
    })
  })

  describe('mapMealPlan', () => {
    it('maps all fields', () => {
      const result = mapMealPlan(makeApiPlan())
      expect(result.id).toBe('plan-1')
      expect(result.title).toBe('My Meal Plan')
      expect(result.type).toBe('Weekly')
      expect(result.active).toBe(true)
      expect(result.reused).toBe(false)
      expect(result.breakfasts).toBe(3)
      expect(result.mains).toBe(4)
    })

    it('maps recipes into CurrentPlan structure', () => {
      const result = mapMealPlan(makeApiPlan())
      expect(result.recipes?.Breakfast).toEqual(['r1', 'r3'])
      expect(result.recipes?.['Lunch/Dinner']).toEqual(['r2'])
    })
  })

  describe('mapMealPlans', () => {
    it('maps an array of plans', () => {
      const result = mapMealPlans([makeApiPlan({ id: '1' }), makeApiPlan({ id: '2' })])
      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('1')
      expect(result[1]?.id).toBe('2')
    })
  })
})
