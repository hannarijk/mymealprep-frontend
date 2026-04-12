import { client } from '@/api/client'
import { mapRecipes } from '@/api/mappers/recipeMapper'
import type { ApiRecipe } from '@/api/types'
import type { Recipe } from '@/types'

export async function fetchRecipes(): Promise<Recipe[]> {
  const data = await client.getAll<ApiRecipe>('/recipes', { limit: 100 })
  return mapRecipes(data)
}
