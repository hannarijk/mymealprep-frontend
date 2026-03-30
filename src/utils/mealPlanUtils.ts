import type { Recipe } from '@/types'

export function getSuggestions(
  recipes: Recipe[],
  selectedIds: Set<number>,
  limit = 8,
): Recipe[] {
  return recipes.filter((r) => !selectedIds.has(r.id)).slice(0, limit)
}
