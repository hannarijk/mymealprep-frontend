export interface Recipe {
  id: number
  name: string
  tags: string[]
  time: number
  servings: number
  liked: boolean
  usedWeeksAgo: number | null
  image: string
  section: 'Breakfast' | 'Lunch/Dinner'
  why: string
  ingredients: string[]
  steps: string[]
}

export interface GroceryItem {
  name: string
  amount: string
  checked: boolean
}

export type GroceryGroup = Record<string, GroceryItem[]>

export interface CurrentPlan {
  Breakfast: number[]
  'Lunch/Dinner': number[]
}

export interface MealPlan {
  id: number
  title: string
  type: 'Weekly' | 'Biweekly'
  breakfasts: number
  mains: number
  notes: string
  reused: boolean
  active?: boolean
  recipeIds?: CurrentPlan
}
