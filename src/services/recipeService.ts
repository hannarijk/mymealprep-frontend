import { client } from '@/api/client'
import { mapRecipes } from '@/api/mappers/recipeMapper'
import type { ApiRecipeListResponse } from '@/api/types'
import type { Recipe } from '@/types'

export async function fetchRecipes(): Promise<Recipe[]> {
  const res = await client.get<ApiRecipeListResponse>('/recipes', { limit: 100 })
  return mapRecipes(res.data)
}
