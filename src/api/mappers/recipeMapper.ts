import type { ApiRecipe } from '@/api/types'
import type { Recipe, Ingredient } from '@/types'

function mapIngredient(api: ApiRecipe['ingredients'][number]): Ingredient {
  return {
    id: api.id,
    name: api.name,
    amount: api.amount,
    department: api.department,
  }
}

export function mapRecipe(api: ApiRecipe): Recipe {
  return {
    id: api.id,
    name: api.name,
    section: api.section,
    tags: api.tags,
    timeMinutes: api.timeMinutes,
    servings: api.servings,
    why: api.why,
    imageUrl: api.imageUrl,
    steps: api.steps,
    liked: api.liked,
    ingredients: api.ingredients.map(mapIngredient),
    usedWeeksAgo: null,
  }
}

export function mapRecipes(apis: ApiRecipe[]): Recipe[] {
  return apis.map(mapRecipe)
}
