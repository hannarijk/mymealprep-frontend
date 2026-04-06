// Raw API response shapes — 1:1 with Go handler JSON output.
// These are separate from UI types (src/types/index.ts) to make the
// contract with the backend explicit and traceable.

export interface ApiIngredient {
  id: string
  name: string
  amount: string
  department: string
}

export interface ApiRecipe {
  id: string
  name: string
  section: 'Breakfast' | 'Lunch/Dinner'
  tags: string[]
  timeMinutes: number
  servings: number
  why: string
  imageUrl: string
  steps: string[]
  liked: boolean
  ingredients: ApiIngredient[]
}

export interface ApiRecipeListResponse {
  data: ApiRecipe[]
  totalCount: number
  page: number
  limit: number
}

export interface ApiPlanRecipe {
  recipeId: string
  section: 'Breakfast' | 'Lunch/Dinner'
}

export interface ApiMealPlan {
  id: string
  title: string
  type: 'Weekly' | 'Biweekly'
  notes: string
  active: boolean
  reused: boolean
  breakfasts: number
  mains: number
  recipes: ApiPlanRecipe[]
  createdAt: string
}

export interface ApiMealPlanListResponse {
  data: ApiMealPlan[]
  totalCount: number
  page: number
  limit: number
}

export interface ApiGroceryItem {
  id: string
  name: string
  amount: string
  department: string
  checked: boolean
  manual: boolean
}

export interface ApiGroceryList {
  id: string
  mealPlanId: string
  departments: Record<string, ApiGroceryItem[]>
  generatedAt: string
}

export interface ApiAuthResponse {
  token: string
  user: {
    id: string
    email: string
  }
}
