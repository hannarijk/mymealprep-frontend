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

export async function fetchCurrentPlan(): Promise<CurrentPlan> {
  let plan: ApiMealPlan

  try {
    plan = await client.get<ApiMealPlan>('/meal-plans/active')
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      const created = await client.post<ApiMealPlan>('/meal-plans', {
        title: activePlanMeta.title,
        type: activePlanMeta.type,
        notes: activePlanMeta.notes,
        recipes: [],
      })
      plan = await client.post<ApiMealPlan>(`/meal-plans/${created.id}/activate`, {})
    } else {
      throw e
    }
  }

  activePlanId = plan.id
  activePlanMeta = { title: plan.title, type: plan.type, notes: plan.notes }
  return mapRecipesToCurrentPlan(plan.recipes)
}

export async function updatePlan(
  plan: CurrentPlan,
  meta?: { type?: 'Weekly' | 'Biweekly' },
): Promise<void> {
  if (!activePlanId) await fetchCurrentPlan()
  if (!activePlanId) return
  if (meta?.type) activePlanMeta.type = meta.type
  await client.put(`/meal-plans/${activePlanId}`, {
    ...activePlanMeta,
    recipes: mapCurrentPlanToRecipes(plan),
  })
  client.post('/grocery/regenerate', {}).catch(() => {})
}

export async function fetchPlanHistory(): Promise<MealPlan[]> {
  const data = await client.getAll<ApiMealPlan>('/meal-plans', { limit: 100 })
  return mapMealPlans(data)
}
