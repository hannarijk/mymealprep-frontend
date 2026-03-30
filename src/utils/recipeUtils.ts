import type { Recipe } from '@/types'

export function filterRecipes(recipes: Recipe[], search: string): Recipe[] {
  const q = search.trim().toLowerCase()
  if (!q) return recipes
  return recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.why.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q),
  )
}

export function paginateItems<T>(items: T[], page: number, pageSize: number): T[] {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return items.slice(start, start + pageSize)
}
