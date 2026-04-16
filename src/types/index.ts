export interface Ingredient {
  id: string
  name: string
  amount: string
  department: string
}

export interface Recipe {
  id: string
  name: string
  tags: string[]
  timeMinutes: number
  servings: number
  liked: boolean
  usedWeeksAgo: number | null
  imageUrl: string
  section: 'Breakfast' | 'Lunch/Dinner'
  why: string
  ingredients: Ingredient[]
  steps: string[]
}

export interface GroceryItem {
  id: string
  name: string
  amount: string
  checked: boolean
  manual?: boolean
}

export type GroceryGroup = Record<string, GroceryItem[]>

export interface CurrentPlan {
  Breakfast: string[]
  'Lunch/Dinner': string[]
}

export interface MealPlan {
  id: string
  title: string
  type: 'Weekly' | 'Biweekly'
  breakfasts: number
  mains: number
  notes: string
  sourcePlanId: string | null
  active?: boolean
  recipes?: CurrentPlan
}
