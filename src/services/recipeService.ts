import { client } from '@/api/client'
import { mapRecipes } from '@/api/mappers/recipeMapper'
import type { ApiRecipeListResponse } from '@/api/types'
import type { Recipe } from '@/types'

export async function fetchRecipes(): Promise<Recipe[]> {
  const limit = 100
  const first = await client.get<ApiRecipeListResponse>('/recipes', { limit, page: 1 })
  const all = [...first.data]
  const totalPages = Math.ceil(first.totalCount / limit)
  for (let page = 2; page <= totalPages; page++) {
    const res = await client.get<ApiRecipeListResponse>('/recipes', { limit, page })
    all.push(...res.data)
  }
  return mapRecipes(all)
}
