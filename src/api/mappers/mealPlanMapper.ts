import type { ApiMealPlan, ApiPlanRecipe } from '@/api/types'
import type { MealPlan, CurrentPlan } from '@/types'

export function mapRecipesToCurrentPlan(recipes: ApiPlanRecipe[]): CurrentPlan {
  const plan: CurrentPlan = { Breakfast: [], 'Lunch/Dinner': [] }
  for (const r of recipes) {
    plan[r.section].push(r.recipeId)
  }
  return plan
}

export function mapCurrentPlanToRecipes(plan: CurrentPlan): ApiPlanRecipe[] {
  const result: ApiPlanRecipe[] = []
  for (const id of plan.Breakfast) {
    result.push({ recipeId: id, section: 'Breakfast' })
  }
  for (const id of plan['Lunch/Dinner']) {
    result.push({ recipeId: id, section: 'Lunch/Dinner' })
  }
  return result
}

export function mapMealPlan(api: ApiMealPlan): MealPlan {
  return {
    id: api.id,
    title: api.title,
    type: api.type,
    notes: api.notes,
    active: api.active,
    sourcePlanId: api.sourcePlanId,
    breakfasts: api.breakfasts,
    mains: api.mains,
    recipes: mapRecipesToCurrentPlan(api.recipes),
  }
}

export function mapMealPlans(apis: ApiMealPlan[]): MealPlan[] {
  return apis.map(mapMealPlan)
}
