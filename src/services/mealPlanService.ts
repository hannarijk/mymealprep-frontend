import { mockCurrentPlan } from '@/mocks/mockRecipes'
import { mockHistory } from '@/mocks/mockHistory'
import type { CurrentPlan, MealPlan } from '@/types'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function fetchCurrentPlan(): Promise<CurrentPlan> {
  await delay()
  return structuredClone(mockCurrentPlan)
}

export async function updatePlan(_plan: CurrentPlan): Promise<void> {
  await delay()
}

export async function fetchPlanHistory(): Promise<MealPlan[]> {
  await delay()
  return structuredClone(mockHistory)
}
