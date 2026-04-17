import { client } from '@/api/client'
import { ApiError } from '@/api/client'
import { mapRecipesToCurrentPlan, mapCurrentPlanToRecipes, mapMealPlans } from '@/api/mappers/mealPlanMapper'
import type { ApiMealPlan } from '@/api/types'
import type { CurrentPlan, MealPlan } from '@/types'

let activePlanId: string | null = null
let activePlanMeta: { title: string; type: 'Weekly' | 'Biweekly'; notes: string } = {
  title: 'My Meal Plan',
  type: 'Weekly',
  notes: '',
}

export async function fetchCurrentPlan(): Promise<{
  recipes: CurrentPlan
  title: string
  type: 'Weekly' | 'Biweekly'
}> {
  let plan: ApiMealPlan

  try {
    plan = await client.get<ApiMealPlan>('/meal-plans/active')
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      plan = await client.post<ApiMealPlan>('/meal-plans', {
        title: activePlanMeta.title,
        type: activePlanMeta.type,
        notes: activePlanMeta.notes,
        recipes: [],
      })
    } else {
      throw e
    }
  }

  activePlanId = plan.id
  activePlanMeta = { title: plan.title, type: plan.type, notes: plan.notes }
  return { recipes: mapRecipesToCurrentPlan(plan.recipes), title: plan.title, type: plan.type }
}

export async function updatePlan(
  plan: CurrentPlan,
  meta?: { type?: 'Weekly' | 'Biweekly'; title?: string },
): Promise<void> {
  if (!activePlanId) await fetchCurrentPlan()
  if (!activePlanId) return
  if (meta?.type) activePlanMeta.type = meta.type
  if (meta?.title) activePlanMeta.title = meta.title
  await client.put(`/meal-plans/${activePlanId}`, {
    ...activePlanMeta,
    recipes: mapCurrentPlanToRecipes(plan),
  })
}

export async function clonePlan(
  planId: string,
  title?: string,
): Promise<{ recipes: CurrentPlan; title: string }> {
  const plan = await client.post<ApiMealPlan>(
    `/meal-plans/${planId}/clone`,
    title ? { title } : {},
  )
  activePlanId = plan.id
  activePlanMeta = { title: plan.title, type: plan.type, notes: plan.notes }
  return { recipes: mapRecipesToCurrentPlan(plan.recipes), title: plan.title }
}

export async function createPlan(title: string): Promise<{
  recipes: CurrentPlan
  title: string
  type: 'Weekly' | 'Biweekly'
}> {
  const plan = await client.post<ApiMealPlan>('/meal-plans', {
    title,
    type: 'Weekly',
    notes: '',
    recipes: [],
  })
  activePlanId = plan.id
  activePlanMeta = { title: plan.title, type: plan.type, notes: plan.notes }
  return { recipes: { Breakfast: [], 'Lunch/Dinner': [] }, title: plan.title, type: plan.type }
}

export async function deletePlan(planId: string): Promise<void> {
  await client.delete(`/meal-plans/${planId}`)
}

export async function fetchPlanHistory(): Promise<MealPlan[]> {
  const data = await client.getAll<ApiMealPlan>('/meal-plans', { limit: 100 })
  return mapMealPlans(data)
}
