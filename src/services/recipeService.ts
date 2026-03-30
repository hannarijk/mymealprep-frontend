import { mockRecipes } from '@/mocks/mockRecipes'
import type { Recipe } from '@/types'

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export async function fetchRecipes(): Promise<Recipe[]> {
  await delay()
  return structuredClone(mockRecipes)
}
